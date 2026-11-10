import { Hono } from 'hono';
import { z } from 'zod';
import { eq, inArray, and, desc } from 'drizzle-orm';
import { AppEnv, authMiddleware, requireRole } from '../middleware/auth';
import { getDb } from '../db/connection';
import {
  bookings,
  bookingItems,
  vehicles,
  users,
  ownerProfiles,
  vehicleAvailability,
  platformSettings,
} from '../db/schema';
import { generateBookingNumber } from '../utils/crypto';
import { createNotification } from '../services/notification.service';

export const bookingRouter = new Hono<AppEnv>();

// Multi-Vehicle Booking Request Schema
const createBookingSchema = z.object({
  eventDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Valid event date YYYY-MM-DD required'),
  eventEndDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Valid end date required').optional(),
  eventType: z.string().min(2, 'Event type required'),
  eventCity: z.string().min(2, 'City required'),
  eventDistrict: z.string().min(2, 'District required'),
  pickupAddress: z.string().min(5, 'Pickup address required'),
  destinationAddress: z.string().min(5, 'Destination address required'),
  customerNotes: z.string().optional(),
  vehicleIds: z.array(z.string()).min(1, 'At least one vehicle must be selected'),
});

// 1. Customer Submits Multi-Vehicle Booking Request
bookingRouter.post('/', authMiddleware, requireRole(['customer', 'admin']), async (c) => {
  try {
    const authUser = c.get('user')!;
    const body = await c.req.json();
    const parsed = createBookingSchema.safeParse(body);
    if (!parsed.success) {
      return c.json({ success: false, error: parsed.error.errors[0].message }, 400);
    }

    const db = getDb(c.env.DB);
    const eventDate = parsed.data.eventDate;
    const eventEndDate = parsed.data.eventEndDate || eventDate;
    const vehicleIds = parsed.data.vehicleIds;

    // Concurrency / Anti-double-booking check
    const unavailable = await db.query.vehicleAvailability.findMany({
      where: and(
        inArray(vehicleAvailability.vehicleId, vehicleIds),
        eq(vehicleAvailability.date, eventDate),
        inArray(vehicleAvailability.status, ['booked', 'blocked', 'held'])
      ),
    });

    if (unavailable.length > 0) {
      return c.json({
        success: false,
        error: 'One or more of the selected vehicles are unavailable on the requested date. Please review your cart.',
        unavailableVehicleIds: unavailable.map((u) => u.vehicleId),
      }, 409);
    }

    // Fetch vehicles
    const selectedVehicles = await db.query.vehicles.findMany({
      where: inArray(vehicles.id, vehicleIds),
      with: {
        category: true,
        images: true,
        owner: true,
      },
    });

    if (selectedVehicles.length !== vehicleIds.length) {
      return c.json({ success: false, error: 'Some selected vehicles could not be found or are inactive.' }, 404);
    }

    // Calculate total price and days
    const d1 = new Date(eventDate);
    const d2 = new Date(eventEndDate);
    const diffDays = Math.max(1, Math.ceil((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24)) + 1);

    let calculatedTotal = 0;
    const itemRecords: any[] = [];

    const bookingId = crypto.randomUUID();
    const bookingNumber = generateBookingNumber();
    const now = new Date().toISOString();

    for (const v of selectedVehicles) {
      const itemPrice = v.perDayPrice * diffDays;
      calculatedTotal += itemPrice;

      const primaryImg = v.images.find((img) => img.isPrimary)?.imageUrl || v.images[0]?.imageUrl || '';

      // Snapshot stores entire pricing and specs to freeze contract terms
      const snapshot = {
        name: v.name,
        make: v.make,
        model: v.model,
        year: v.year,
        registrationNumber: v.registrationNumber,
        categoryName: v.category?.name,
        capacity: v.capacity,
        perDayPrice: v.perDayPrice,
        perEventPrice: v.perEventPrice,
        extraKmRate: v.extraKmRate,
        driverAllowance: v.driverAllowance,
        city: v.city,
        primaryImage: primaryImg,
      };

      itemRecords.push({
        id: crypto.randomUUID(),
        bookingId,
        vehicleId: v.id,
        ownerId: v.ownerId,
        pricePerDay: v.perDayPrice,
        daysCount: diffDays,
        totalItemPrice: itemPrice,
        status: 'pending_owner',
        snapshotDataJson: JSON.stringify(snapshot),
        createdAt: now,
        updatedAt: now,
      });
    }

    // Read configured advance percentage
    const advanceSetting = await db.query.platformSettings.findFirst({
      where: eq(platformSettings.key, 'advance_payment_percentage'),
    });
    const advancePercentage = advanceSetting ? parseFloat(advanceSetting.value) : 25;
    const advanceAmountRequired = Math.round((calculatedTotal * advancePercentage) / 100);

    // Insert Main Booking
    await db.insert(bookings).values({
      id: bookingId,
      bookingNumber,
      customerId: authUser.userId,
      eventDate,
      eventEndDate,
      eventType: parsed.data.eventType,
      eventCity: parsed.data.eventCity,
      eventDistrict: parsed.data.eventDistrict,
      pickupAddress: parsed.data.pickupAddress,
      destinationAddress: parsed.data.destinationAddress,
      totalAmount: calculatedTotal,
      advancePercentage,
      advanceAmountRequired,
      advanceAmountPaid: 0,
      balanceAmount: calculatedTotal,
      status: 'owner_review', // Moves to owner review step
      customerNotes: parsed.data.customerNotes || '',
      createdAt: now,
      updatedAt: now,
    });

    // Insert all items
    for (const item of itemRecords) {
      await db.insert(bookingItems).values(item);
    }

    // Place temporary hold on vehicles for anti-collision
    for (const v of selectedVehicles) {
      const holdExpiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hr hold
      await db.insert(vehicleAvailability).values({
        id: crypto.randomUUID(),
        vehicleId: v.id,
        date: eventDate,
        status: 'held',
        bookingId,
        holdExpiresAt,
        createdAt: now,
      });
    }

    // Notify Owners (privacy protected: only their own vehicle)
    const notifiedOwners = new Set<string>();
    for (const v of selectedVehicles) {
      if (!notifiedOwners.has(v.ownerId)) {
        notifiedOwners.add(v.ownerId);
        await createNotification(db, {
          userId: v.ownerId,
          title: `New Booking Request #${bookingNumber}`,
          message: `Booking request received for vehicle "${v.name}" on ${eventDate} in ${parsed.data.eventCity}. Please accept or reject.`,
          type: 'owner_request',
          metadata: { bookingId, bookingNumber, vehicleId: v.id, date: eventDate },
        });
      }
    }

    // Customer Notification
    await createNotification(db, {
      userId: authUser.userId,
      title: `Booking Request Submitted #${bookingNumber}`,
      message: `Your booking request for ${selectedVehicles.length} vehicle(s) on ${eventDate} has been sent for owner and admin confirmation.`,
      type: 'booking_update',
      metadata: { bookingId, bookingNumber },
    });

    return c.json({
      success: true,
      message: 'Booking request created successfully.',
      booking: {
        id: bookingId,
        bookingNumber,
        eventDate,
        totalAmount: calculatedTotal,
        advanceAmountRequired,
        itemCount: selectedVehicles.length,
        status: 'owner_review',
      },
    }, 201);
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

// 2. Customer Booking History
bookingRouter.get('/my', authMiddleware, async (c) => {
  try {
    const authUser = c.get('user')!;
    const db = getDb(c.env.DB);

    const customerBookings = await db.query.bookings.findMany({
      where: eq(bookings.customerId, authUser.userId),
      orderBy: [desc(bookings.createdAt)],
      with: {
        items: {
          with: {
            vehicle: true,
            ownerResponse: true,
          },
        },
        payments: true,
      },
    });

    const formatted = customerBookings.map((b) => ({
      ...b,
      items: b.items.map((item) => {
        let snapshot: any = null;
        try { snapshot = JSON.parse(item.snapshotDataJson || '{}'); } catch {}
        return {
          id: item.id,
          vehicleId: item.vehicleId,
          vehicleName: snapshot?.name || item.vehicle?.name,
          categoryName: snapshot?.categoryName,
          primaryImage: snapshot?.primaryImage,
          pricePerDay: item.pricePerDay,
          daysCount: item.daysCount,
          totalItemPrice: item.totalItemPrice,
          status: item.status,
          ownerResponse: item.ownerResponse ? {
            response: item.ownerResponse.response,
            reason: item.ownerResponse.reason,
            respondedAt: item.ownerResponse.respondedAt,
          } : undefined,
        };
      }),
    }));

    return c.json({ success: true, bookings: formatted });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

// 3. Customer / Owner / Admin Single Booking Details
bookingRouter.get('/:id', authMiddleware, async (c) => {
  try {
    const authUser = c.get('user')!;
    const bookingId = c.req.param('id');
    if (!bookingId) {
      return c.json({ success: false, error: 'Booking ID required' }, 400);
    }
    const db = getDb(c.env.DB);

    const booking = await db.query.bookings.findFirst({
      where: eq(bookings.id, bookingId),
      with: {
        customer: true,
        items: {
          with: {
            vehicle: true,
            owner: true,
            ownerResponse: true,
          },
        },
        payments: true,
      },
    });

    if (!booking) {
      return c.json({ success: false, error: 'Booking not found' }, 404);
    }

    // Role check: customer can see their own, admin can see all, owner only sees their own items
    if (authUser.role === 'customer' && booking.customerId !== authUser.userId) {
      return c.json({ success: false, error: 'Forbidden' }, 403);
    }

    let itemsToReturn = booking.items;
    if (authUser.role === 'owner') {
      itemsToReturn = itemsToReturn.filter((i) => i.ownerId === authUser.userId);
    }

    const formattedItems = itemsToReturn.map((item) => {
      let snapshot: any = null;
      try { snapshot = JSON.parse(item.snapshotDataJson || '{}'); } catch {}
      return {
        id: item.id,
        vehicleId: item.vehicleId,
        vehicleName: snapshot?.name || item.vehicle?.name,
        categoryName: snapshot?.categoryName,
        primaryImage: snapshot?.primaryImage,
        pricePerDay: item.pricePerDay,
        daysCount: item.daysCount,
        totalItemPrice: item.totalItemPrice,
        status: item.status,
        ownerId: item.ownerId,
        ownerName: item.owner?.name,
        ownerResponse: item.ownerResponse ? {
          response: item.ownerResponse.response,
          reason: item.ownerResponse.reason,
          respondedAt: item.ownerResponse.respondedAt,
        } : undefined,
      };
    });

    return c.json({
      success: true,
      booking: {
        ...booking,
        customerName: booking.customer.name,
        customerEmail: booking.customer.email,
        customerPhone: booking.customer.phone,
        items: formattedItems,
      },
    });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

import { Hono } from 'hono';
import { z } from 'zod';
import { eq, and, desc, inArray } from 'drizzle-orm';
import { AppEnv, authMiddleware, requireRole } from '../middleware/auth';
import { getDb } from '../db/connection';
import {
  vehicles,
  bookingItems,
  bookings,
  ownerResponses,
  users,
  ownerProfiles,
  vehicleImages,
} from '../db/schema';
import { createNotification } from '../services/notification.service';

export const ownerRouter = new Hono<AppEnv>();

// Protect all owner routes
ownerRouter.use('*', authMiddleware, requireRole(['owner', 'admin']));

// 1. Get Owner's Vehicles
ownerRouter.get('/vehicles', async (c) => {
  try {
    const authUser = c.get('user')!;
    const db = getDb(c.env.DB);

    const ownerVehicles = await db.query.vehicles.findMany({
      where: eq(vehicles.ownerId, authUser.userId),
      orderBy: [desc(vehicles.createdAt)],
      with: {
        category: true,
        images: true,
      },
    });

    const formatted = ownerVehicles.map((v) => {
      let features: string[] = [];
      let rules: string[] = [];
      try { features = JSON.parse(v.featuresJson); } catch {}
      try { rules = JSON.parse(v.rulesJson); } catch {}
      const primaryImg = v.images.find((img) => img.isPrimary)?.imageUrl || v.images[0]?.imageUrl || '';

      return {
        ...v,
        categoryName: v.category?.name,
        primaryImage: primaryImg,
        features,
        rules,
      };
    });

    return c.json({ success: true, vehicles: formatted });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

// 2. Get Owner's Booking Requests
ownerRouter.get('/booking-requests', async (c) => {
  try {
    const authUser = c.get('user')!;
    const db = getDb(c.env.DB);

    // Fetch only items belonging to this owner
    const items = await db.query.bookingItems.findMany({
      where: eq(bookingItems.ownerId, authUser.userId),
      orderBy: [desc(bookingItems.createdAt)],
      with: {
        booking: {
          with: {
            customer: true,
          },
        },
        vehicle: true,
        ownerResponse: true,
      },
    });

    const formatted = items.map((item) => {
      let snapshot: any = null;
      try { snapshot = JSON.parse(item.snapshotDataJson || '{}'); } catch {}

      return {
        itemId: item.id,
        bookingId: item.bookingId,
        bookingNumber: item.booking.bookingNumber,
        bookingStatus: item.booking.status,
        eventDate: item.booking.eventDate,
        eventEndDate: item.booking.eventEndDate,
        eventType: item.booking.eventType,
        eventCity: item.booking.eventCity,
        pickupAddress: item.booking.pickupAddress,
        destinationAddress: item.booking.destinationAddress,
        customerName: item.booking.customer.name,
        customerPhone: item.booking.customer.phone,
        vehicleId: item.vehicleId,
        vehicleName: snapshot?.name || item.vehicle.name,
        registrationNumber: snapshot?.registrationNumber || item.vehicle.registrationNumber,
        pricePerDay: item.pricePerDay,
        daysCount: item.daysCount,
        totalItemPrice: item.totalItemPrice,
        status: item.status,
        ownerResponse: item.ownerResponse ? {
          response: item.ownerResponse.response,
          reason: item.ownerResponse.reason,
          respondedAt: item.ownerResponse.respondedAt,
        } : null,
        createdAt: item.createdAt,
      };
    });

    return c.json({ success: true, requests: formatted });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

// 3. Owner Responds to Booking Request (Accept / Reject)
const respondSchema = z.object({
  response: z.enum(['accepted', 'rejected']),
  reason: z.string().optional(),
});

ownerRouter.post('/booking-requests/:itemId/respond', async (c) => {
  try {
    const authUser = c.get('user')!;
    const itemId = c.req.param('itemId');
    if (!itemId) {
      return c.json({ success: false, error: 'Item ID required' }, 400);
    }
    const body = await c.req.json();
    const parsed = respondSchema.safeParse(body);
    if (!parsed.success) {
      return c.json({ success: false, error: parsed.error.errors[0].message }, 400);
    }

    const db = getDb(c.env.DB);
    const item = await db.query.bookingItems.findFirst({
      where: eq(bookingItems.id, itemId),
      with: {
        booking: true,
        vehicle: true,
      },
    });

    if (!item) {
      return c.json({ success: false, error: 'Booking item not found' }, 404);
    }

    // Privacy rule check
    if (authUser.role !== 'admin' && item.ownerId !== authUser.userId) {
      return c.json({ success: false, error: 'Forbidden. You do not own this vehicle request.' }, 403);
    }

    const now = new Date().toISOString();
    const newStatus = parsed.data.response === 'accepted' ? 'accepted_by_owner' : 'rejected_by_owner';

    // Insert or update owner response
    const existingResponse = await db.query.ownerResponses.findFirst({
      where: eq(ownerResponses.bookingItemId, itemId),
    });

    if (existingResponse) {
      await db.update(ownerResponses).set({
        response: parsed.data.response,
        reason: parsed.data.reason || '',
        respondedAt: now,
      }).where(eq(ownerResponses.id, existingResponse.id));
    } else {
      await db.insert(ownerResponses).values({
        id: crypto.randomUUID(),
        bookingItemId: itemId,
        ownerId: authUser.userId,
        response: parsed.data.response,
        reason: parsed.data.reason || '',
        respondedAt: now,
      });
    }

    // Update booking item status
    await db.update(bookingItems).set({
      status: newStatus,
      updatedAt: now,
    }).where(eq(bookingItems.id, itemId));

    // Check if all items in this booking now have responses
    const allItems = await db.query.bookingItems.findMany({
      where: eq(bookingItems.bookingId, item.bookingId),
    });

    const anyPendingOwner = allItems.some((i) => i.status === 'pending_owner');
    if (!anyPendingOwner) {
      // Progress booking to admin_review
      await db.update(bookings).set({
        status: 'admin_review',
        updatedAt: now,
      }).where(eq(bookings.id, item.bookingId));
    }

    // Notify Customer
    await createNotification(db, {
      userId: item.booking.customerId,
      title: `Vehicle Update on Booking #${item.booking.bookingNumber}`,
      message: `The owner has ${parsed.data.response} your request for "${item.vehicle.name}".`,
      type: 'booking_update',
      metadata: { bookingId: item.bookingId, itemId, response: parsed.data.response },
    });

    return c.json({
      success: true,
      message: `Response submitted: Vehicle ${parsed.data.response}`,
    });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

// 4. Owner Earnings Summary
ownerRouter.get('/earnings', async (c) => {
  try {
    const authUser = c.get('user')!;
    const db = getDb(c.env.DB);

    const confirmedItems = await db.query.bookingItems.findMany({
      where: and(
        eq(bookingItems.ownerId, authUser.userId),
        eq(bookingItems.status, 'confirmed')
      ),
      with: {
        booking: true,
        vehicle: true,
      },
    });

    const totalRevenue = confirmedItems.reduce((acc, i) => acc + i.totalItemPrice, 0);

    return c.json({
      success: true,
      stats: {
        totalConfirmedBookings: confirmedItems.length,
        totalRevenue,
        estimatedPayout: Math.round(totalRevenue * 0.9), // Less 10% platform fee
      },
      confirmedItems: confirmedItems.map((i) => ({
        id: i.id,
        bookingNumber: i.booking.bookingNumber,
        vehicleName: i.vehicle.name,
        eventDate: i.booking.eventDate,
        totalItemPrice: i.totalItemPrice,
      })),
    });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

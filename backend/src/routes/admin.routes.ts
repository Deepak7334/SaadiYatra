import { Hono } from 'hono';
import { z } from 'zod';
import { eq, desc, sql, inArray } from 'drizzle-orm';
import { AppEnv, authMiddleware, requireRole } from '../middleware/auth';
import { getDb } from '../db/connection';
import {
  users,
  ownerProfiles,
  vehicles,
  vehicleCategories,
  bookings,
  bookingItems,
  payments,
  platformSettings,
  locations,
  auditLogs,
} from '../db/schema';
import { createNotification } from '../services/notification.service';

export const adminRouter = new Hono<AppEnv>();

// Protect all admin routes
adminRouter.use('*', authMiddleware, requireRole(['admin']));

// 1. Dashboard Analytics
adminRouter.get('/stats', async (c) => {
  try {
    const db = getDb(c.env.DB);

    const [allUsers, allVehicles, allBookings, allPayments] = await Promise.all([
      db.query.users.findMany(),
      db.query.vehicles.findMany(),
      db.query.bookings.findMany(),
      db.query.payments.findMany(),
    ]);

    const totalCustomers = allUsers.filter((u) => u.role === 'customer').length;
    const totalOwners = allUsers.filter((u) => u.role === 'owner').length;
    const totalVehicles = allVehicles.length;
    const pendingVehicleApprovals = allVehicles.filter((v) => v.status === 'pending_approval').length;
    const activeVehicles = allVehicles.filter((v) => v.status === 'approved').length;

    const totalBookings = allBookings.length;
    const confirmedBookings = allBookings.filter((b) => b.status === 'confirmed').length;
    const pendingPayments = allBookings.filter((b) => b.status === 'approved_pending_payment').length;
    const completedBookings = allBookings.filter((b) => b.status === 'completed').length;
    const cancelledBookings = allBookings.filter((b) => b.status === 'cancelled').length;

    const totalRevenue = allPayments
      .filter((p) => p.status === 'captured')
      .reduce((sum, p) => sum + p.amount, 0);

    return c.json({
      success: true,
      stats: {
        totalCustomers,
        totalOwners,
        totalVehicles,
        pendingVehicleApprovals,
        activeVehicles,
        totalBookings,
        confirmedBookings,
        pendingPayments,
        completedBookings,
        cancelledBookings,
        totalRevenue,
      },
    });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

// 2. Owner Management
adminRouter.get('/owners', async (c) => {
  try {
    const db = getDb(c.env.DB);
    const owners = await db.query.users.findMany({
      where: eq(users.role, 'owner'),
      orderBy: [desc(users.createdAt)],
      with: {
        ownerProfile: true,
        vehicles: true,
      },
    });

    const formatted = owners.map((o) => ({
      id: o.id,
      name: o.name,
      email: o.email,
      phone: o.phone,
      status: o.status,
      isVerified: o.isVerified,
      businessName: o.ownerProfile?.businessName,
      city: o.ownerProfile?.city,
      district: o.ownerProfile?.district,
      verificationStatus: o.ownerProfile?.verificationStatus,
      idDocumentType: o.ownerProfile?.idDocumentType,
      idDocumentUrl: o.ownerProfile?.idDocumentUrl,
      vehicleCount: o.vehicles.length,
      createdAt: o.createdAt,
    }));

    return c.json({ success: true, owners: formatted });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

const verifyOwnerSchema = z.object({
  status: z.enum(['approved', 'rejected']),
});

adminRouter.put('/owners/:id/verify', async (c) => {
  try {
    const ownerId = c.req.param('id');
    if (!ownerId) {
      return c.json({ success: false, error: 'Owner ID required' }, 400);
    }
    const body = await c.req.json();
    const parsed = verifyOwnerSchema.safeParse(body);
    if (!parsed.success) {
      return c.json({ success: false, error: parsed.error.errors[0].message }, 400);
    }

    const db = getDb(c.env.DB);
    const now = new Date().toISOString();

    await db.update(ownerProfiles).set({
      verificationStatus: parsed.data.status,
      updatedAt: now,
    }).where(eq(ownerProfiles.userId, ownerId));

    await db.update(users).set({
      isVerified: parsed.data.status === 'approved',
      updatedAt: now,
    }).where(eq(users.id, ownerId));

    await createNotification(db, {
      userId: ownerId,
      title: `Account Verification: ${parsed.data.status.toUpperCase()}`,
      message: parsed.data.status === 'approved'
        ? 'Congratulations! Your vehicle owner account has been approved by ShaadiYatra Admin.'
        : 'Your vehicle owner account verification was not approved. Please contact support.',
      type: 'admin_alert',
    });

    return c.json({ success: true, message: `Owner status updated to ${parsed.data.status}` });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

// 3. Vehicle Management
adminRouter.get('/vehicles', async (c) => {
  try {
    const db = getDb(c.env.DB);
    const vehicleList = await db.query.vehicles.findMany({
      orderBy: [desc(vehicles.createdAt)],
      with: {
        category: true,
        owner: true,
        images: true,
      },
    });

    const formatted = vehicleList.map((v) => ({
      ...v,
      categoryName: v.category?.name,
      ownerName: v.owner?.name,
      ownerPhone: v.owner?.phone,
      primaryImage: v.images.find((img) => img.isPrimary)?.imageUrl || v.images[0]?.imageUrl || '',
    }));

    return c.json({ success: true, vehicles: formatted });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

const updateVehicleStatusSchema = z.object({
  status: z.enum(['approved', 'rejected', 'suspended', 'pending_approval']),
});

adminRouter.put('/vehicles/:id/status', async (c) => {
  try {
    const vehicleId = c.req.param('id');
    if (!vehicleId) {
      return c.json({ success: false, error: 'Vehicle ID required' }, 400);
    }
    const body = await c.req.json();
    const parsed = updateVehicleStatusSchema.safeParse(body);
    if (!parsed.success) {
      return c.json({ success: false, error: parsed.error.errors[0].message }, 400);
    }

    const db = getDb(c.env.DB);
    const vehicle = await db.query.vehicles.findFirst({
      where: eq(vehicles.id, vehicleId),
    });

    if (!vehicle) {
      return c.json({ success: false, error: 'Vehicle not found' }, 404);
    }

    const now = new Date().toISOString();
    await db.update(vehicles).set({
      status: parsed.data.status,
      updatedAt: now,
    }).where(eq(vehicles.id, vehicleId));

    await createNotification(db, {
      userId: vehicle.ownerId,
      title: `Vehicle Listing ${parsed.data.status.replace('_', ' ').toUpperCase()}`,
      message: `Your listing for "${vehicle.name}" is now ${parsed.data.status}.`,
      type: 'admin_alert',
    });

    return c.json({ success: true, message: `Vehicle status updated to ${parsed.data.status}` });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

// 4. Booking Management
adminRouter.get('/bookings', async (c) => {
  try {
    const db = getDb(c.env.DB);
    const allBookings = await db.query.bookings.findMany({
      orderBy: [desc(bookings.createdAt)],
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

    const formatted = allBookings.map((b) => ({
      ...b,
      customerName: b.customer?.name,
      customerEmail: b.customer?.email,
      customerPhone: b.customer?.phone,
      items: b.items.map((i) => {
        let snapshot: any = null;
        try { snapshot = JSON.parse(i.snapshotDataJson || '{}'); } catch {}
        return {
          id: i.id,
          vehicleId: i.vehicleId,
          vehicleName: snapshot?.name || i.vehicle?.name,
          categoryName: snapshot?.categoryName,
          primaryImage: snapshot?.primaryImage,
          pricePerDay: i.pricePerDay,
          daysCount: i.daysCount,
          totalItemPrice: i.totalItemPrice,
          status: i.status,
          ownerId: i.ownerId,
          ownerName: i.owner?.name,
          ownerPhone: i.owner?.phone,
          ownerResponse: i.ownerResponse ? {
            response: i.ownerResponse.response,
            reason: i.ownerResponse.reason,
            respondedAt: i.ownerResponse.respondedAt,
          } : undefined,
        };
      }),
    }));

    return c.json({ success: true, bookings: formatted });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

// 5. Admin Final Booking Approval & Advance Order Generation
const adminReviewSchema = z.object({
  approvedItemIds: z.array(z.string()).min(1, 'Select at least one vehicle to approve'),
  rejectedItemIds: z.array(z.string()).default([]),
  advancePercentage: z.number().min(10).max(100).optional(),
  adminNotes: z.string().optional(),
});

adminRouter.put('/bookings/:id/review', async (c) => {
  try {
    const bookingId = c.req.param('id');
    if (!bookingId) {
      return c.json({ success: false, error: 'Booking ID required' }, 400);
    }
    const body = await c.req.json();
    const parsed = adminReviewSchema.safeParse(body);
    if (!parsed.success) {
      return c.json({ success: false, error: parsed.error.errors[0].message }, 400);
    }

    const db = getDb(c.env.DB);
    const booking = await db.query.bookings.findFirst({
      where: eq(bookings.id, bookingId),
      with: {
        items: true,
        customer: true,
      },
    });

    if (!booking) {
      return c.json({ success: false, error: 'Booking not found' }, 404);
    }

    const now = new Date().toISOString();

    // Update Approved Items
    for (const itemId of parsed.data.approvedItemIds) {
      await db.update(bookingItems).set({
        status: 'approved_by_admin',
        updatedAt: now,
      }).where(eq(bookingItems.id, itemId));
    }

    // Update Rejected Items
    for (const itemId of parsed.data.rejectedItemIds) {
      await db.update(bookingItems).set({
        status: 'rejected_by_admin',
        updatedAt: now,
      }).where(eq(bookingItems.id, itemId));
    }

    // Recalculate revised total from only approved items
    const approvedItems = booking.items.filter((i) => parsed.data.approvedItemIds.includes(i.id));
    const revisedTotal = approvedItems.reduce((sum, i) => sum + i.totalItemPrice, 0);

    const advancePct = parsed.data.advancePercentage || booking.advancePercentage || 25;
    const advanceAmountRequired = Math.round((revisedTotal * advancePct) / 100);

    // Update booking status to approved_pending_payment
    await db.update(bookings).set({
      totalAmount: revisedTotal,
      advancePercentage: advancePct,
      advanceAmountRequired,
      balanceAmount: revisedTotal,
      status: 'approved_pending_payment',
      adminNotes: parsed.data.adminNotes || '',
      updatedAt: now,
    }).where(eq(bookings.id, bookingId));

    // Create payment order record
    const mockOrderId = `order_${crypto.randomUUID().slice(0, 14)}`;
    await db.insert(payments).values({
      id: crypto.randomUUID(),
      bookingId,
      paymentType: 'advance',
      amount: advanceAmountRequired,
      currency: 'INR',
      razorpayOrderId: mockOrderId,
      status: 'created',
      createdAt: now,
      updatedAt: now,
    });

    // Notify Customer to pay advance
    await createNotification(db, {
      userId: booking.customerId,
      title: `Booking Approved! Advance Payment Required #${booking.bookingNumber}`,
      message: `Your booking has been approved by Admin for ₹${revisedTotal.toLocaleString('en-IN')}. Please pay the advance of ₹${advanceAmountRequired.toLocaleString('en-IN')} (${advancePct}%) to confirm your booking.`,
      type: 'payment_success',
      metadata: { bookingId, advanceAmountRequired, orderId: mockOrderId },
    });

    return c.json({
      success: true,
      message: 'Booking review completed. Customer can now pay the advance online.',
      revisedTotal,
      advanceAmountRequired,
      orderId: mockOrderId,
    });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

// 6. Platform Settings
adminRouter.get('/settings', async (c) => {
  try {
    const db = getDb(c.env.DB);
    const settings = await db.query.platformSettings.findMany();
    return c.json({ success: true, settings });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

adminRouter.put('/settings', async (c) => {
  try {
    const body = await c.req.json();
    const db = getDb(c.env.DB);
    const now = new Date().toISOString();

    for (const [key, value] of Object.entries(body)) {
      if (typeof value === 'string') {
        const existing = await db.query.platformSettings.findFirst({
          where: eq(platformSettings.key, key),
        });

        if (existing) {
          await db.update(platformSettings).set({
            value,
            updatedAt: now,
          }).where(eq(platformSettings.key, key));
        } else {
          await db.insert(platformSettings).values({
            key,
            value,
            description: '',
            updatedAt: now,
          });
        }
      }
    }

    return c.json({ success: true, message: 'Settings updated successfully' });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

// 7. Locations
adminRouter.get('/locations', async (c) => {
  try {
    const db = getDb(c.env.DB);
    const locs = await db.query.locations.findMany();
    return c.json({ success: true, locations: locs });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

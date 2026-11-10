import { Hono } from 'hono';
import { z } from 'zod';
import { eq, and, inArray, gte } from 'drizzle-orm';
import { AppEnv, authMiddleware, requireRole } from '../middleware/auth';
import { getDb } from '../db/connection';
import { vehicleAvailability, vehicles } from '../db/schema';

export const availabilityRouter = new Hono<AppEnv>();

// 1. Get vehicle availability calendar
availabilityRouter.get('/:vehicleId', async (c) => {
  try {
    const vehicleId = c.req.param('vehicleId');
    if (!vehicleId) {
      return c.json({ success: false, error: 'vehicleId is required' }, 400);
    }

    const db = getDb(c.env.DB);
    const startDate = c.req.query('startDate') || new Date().toISOString().slice(0, 10);

    const records = await db.query.vehicleAvailability.findMany({
      where: and(
        eq(vehicleAvailability.vehicleId, vehicleId),
        gte(vehicleAvailability.date, startDate)
      ),
    });

    return c.json({ success: true, availability: records });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

// 2. Owner Blocks or Unblocks Dates for their vehicle
const blockDateSchema = z.object({
  dates: z.array(z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD')),
  action: z.enum(['block', 'unblock']),
});

availabilityRouter.post('/:vehicleId/manage', authMiddleware, requireRole(['owner', 'admin']), async (c) => {
  try {
    const authUser = c.get('user')!;
    const vehicleId = c.req.param('vehicleId');
    if (!vehicleId) {
      return c.json({ success: false, error: 'vehicleId is required' }, 400);
    }

    const body = await c.req.json();
    const parsed = blockDateSchema.safeParse(body);
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

    // Ensure owner can only block their own vehicle
    if (authUser.role !== 'admin' && vehicle.ownerId !== authUser.userId) {
      return c.json({ success: false, error: 'Forbidden. You do not own this vehicle' }, 403);
    }

    const now = new Date().toISOString();

    for (const date of parsed.data.dates) {
      const existing = await db.query.vehicleAvailability.findFirst({
        where: and(
          eq(vehicleAvailability.vehicleId, vehicleId),
          eq(vehicleAvailability.date, date)
        ),
      });

      if (parsed.data.action === 'block') {
        if (existing) {
          if (existing.status === 'booked') {
            return c.json({
              success: false,
              error: `Cannot block date ${date} as it is already confirmed for a booking.`
            }, 400);
          }
          await db.update(vehicleAvailability)
            .set({ status: 'blocked' })
            .where(eq(vehicleAvailability.id, existing.id));
        } else {
          await db.insert(vehicleAvailability).values({
            id: crypto.randomUUID(),
            vehicleId,
            date,
            status: 'blocked',
            createdAt: now,
          });
        }
      } else {
        // Unblock
        if (existing && existing.status === 'blocked') {
          await db.delete(vehicleAvailability).where(eq(vehicleAvailability.id, existing.id));
        }
      }
    }

    return c.json({ success: true, message: `Dates updated successfully` });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

// 3. Multi-Vehicle Availability Check for Cart
const checkMultiSchema = z.object({
  vehicleIds: z.array(z.string()).min(1),
  eventDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  eventEndDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

availabilityRouter.post('/check-multiple', async (c) => {
  try {
    const body = await c.req.json();
    const parsed = checkMultiSchema.safeParse(body);
    if (!parsed.success) {
      return c.json({ success: false, error: parsed.error.errors[0].message }, 400);
    }

    const db = getDb(c.env.DB);
    const eventDate = parsed.data.eventDate;
    const vehicleIds = parsed.data.vehicleIds;

    const unavailableRecords = await db.query.vehicleAvailability.findMany({
      where: and(
        inArray(vehicleAvailability.vehicleId, vehicleIds),
        eq(vehicleAvailability.date, eventDate),
        inArray(vehicleAvailability.status, ['booked', 'blocked', 'held'])
      ),
    });

    const unavailableVehicleIds = unavailableRecords.map((r) => r.vehicleId);
    const allAvailable = unavailableVehicleIds.length === 0;

    return c.json({
      success: true,
      allAvailable,
      unavailableVehicleIds,
    });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

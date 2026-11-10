import { Hono } from 'hono';
import { z } from 'zod';
import { eq, and, gte, lte, inArray, sql } from 'drizzle-orm';
import { AppEnv, authMiddleware, requireRole } from '../middleware/auth';
import { getDb } from '../db/connection';
import { vehicles, vehicleImages, vehicleCategories, vehicleAvailability, users, ownerProfiles } from '../db/schema';

export const vehicleRouter = new Hono<AppEnv>();

// Add Vehicle Schema
const addVehicleSchema = z.object({
  categoryId: z.string().min(1, 'Category is required'),
  name: z.string().min(2, 'Vehicle name is required (e.g. White Scorpio S11)'),
  make: z.string().min(1, 'Make is required (e.g. Mahindra, Toyota)'),
  model: z.string().min(1, 'Model is required'),
  year: z.number().int().min(2010).max(2027),
  registrationNumber: z.string().min(6, 'Valid registration plate required (e.g. BR01AB1234)'),
  capacity: z.number().int().min(1).max(100),
  perDayPrice: z.number().positive('Daily price must be positive'),
  perEventPrice: z.number().positive('Event package price must be positive'),
  extraKmRate: z.number().nonnegative().default(15),
  driverAllowance: z.number().nonnegative().default(500),
  city: z.string().min(2, 'City is required'),
  district: z.string().min(2, 'District is required'),
  address: z.string().min(5, 'Base location address is required'),
  description: z.string().min(10, 'Detailed vehicle description is required'),
  features: z.array(z.string()).default([]),
  rules: z.array(z.string()).default([]),
  images: z.array(z.string()).optional(),
});

// 1. Public Vehicle Search & Listing
vehicleRouter.get('/', async (c) => {
  try {
    const db = getDb(c.env.DB);
    const query = c.req.query();

    const city = query.city;
    const district = query.district;
    const categoryId = query.categoryId;
    const minPrice = query.minPrice ? parseFloat(query.minPrice) : undefined;
    const maxPrice = query.maxPrice ? parseFloat(query.maxPrice) : undefined;
    const minCapacity = query.capacity ? parseInt(query.capacity) : undefined;
    const eventDate = query.eventDate; // YYYY-MM-DD
    const eventEndDate = query.eventEndDate || eventDate;

    // Filter only approved vehicles for public browsing
    const conditions: any[] = [eq(vehicles.status, 'approved')];

    if (city) conditions.push(eq(vehicles.city, city));
    if (district) conditions.push(eq(vehicles.district, district));
    if (categoryId) conditions.push(eq(vehicles.categoryId, categoryId));
    if (minPrice !== undefined) conditions.push(gte(vehicles.perDayPrice, minPrice));
    if (maxPrice !== undefined) conditions.push(lte(vehicles.perDayPrice, maxPrice));
    if (minCapacity !== undefined) conditions.push(gte(vehicles.capacity, minCapacity));

    let vehicleList = await db.query.vehicles.findMany({
      where: and(...conditions),
      with: {
        category: true,
        images: true,
        owner: {
          with: {
            ownerProfile: true,
          },
        },
      },
    });

    // If date is requested, filter out vehicles that are booked, blocked, or held on that date
    if (eventDate) {
      // Find all unavailable vehicle IDs on that date
      const unavailableRecords = await db.query.vehicleAvailability.findMany({
        where: and(
          eq(vehicleAvailability.date, eventDate),
          inArray(vehicleAvailability.status, ['booked', 'blocked', 'held'])
        ),
      });

      const unavailableIds = new Set(unavailableRecords.map((r) => r.vehicleId));
      vehicleList = vehicleList.filter((v) => !unavailableIds.has(v.id));
    }

    const formatted = vehicleList.map((v) => {
      let features: string[] = [];
      let rules: string[] = [];
      try { features = JSON.parse(v.featuresJson); } catch {}
      try { rules = JSON.parse(v.rulesJson); } catch {}

      const primaryImg = v.images.find((img) => img.isPrimary)?.imageUrl || v.images[0]?.imageUrl || '';

      return {
        id: v.id,
        ownerId: v.ownerId,
        ownerName: v.owner?.name,
        ownerBusiness: v.owner?.ownerProfile?.businessName,
        isOwnerVerified: v.owner?.ownerProfile?.verificationStatus === 'approved',
        categoryId: v.categoryId,
        categoryName: v.category?.name,
        name: v.name,
        make: v.make,
        model: v.model,
        year: v.year,
        registrationNumber: v.registrationNumber,
        capacity: v.capacity,
        perDayPrice: v.perDayPrice,
        perEventPrice: v.perEventPrice,
        extraKmRate: v.extraKmRate,
        driverAllowance: v.driverAllowance,
        status: v.status,
        city: v.city,
        district: v.district,
        address: v.address,
        description: v.description,
        features,
        rules,
        isFeatured: v.isFeatured,
        primaryImage: primaryImg,
        images: v.images,
        createdAt: v.createdAt,
      };
    });

    return c.json({ success: true, vehicles: formatted });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

// 2. Public Vehicle Details
vehicleRouter.get('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    if (!id) {
      return c.json({ success: false, error: 'Vehicle ID required' }, 400);
    }
    const db = getDb(c.env.DB);

    const vehicle = await db.query.vehicles.findFirst({
      where: eq(vehicles.id, id),
      with: {
        category: true,
        images: true,
        owner: {
          with: {
            ownerProfile: true,
          },
        },
        reviews: true,
      },
    });

    if (!vehicle) {
      return c.json({ success: false, error: 'Vehicle not found' }, 404);
    }

    let features: string[] = [];
    let rules: string[] = [];
    try { features = JSON.parse(vehicle.featuresJson); } catch {}
    try { rules = JSON.parse(vehicle.rulesJson); } catch {}

    const primaryImg = vehicle.images.find((img) => img.isPrimary)?.imageUrl || vehicle.images[0]?.imageUrl || '';

    return c.json({
      success: true,
      vehicle: {
        ...vehicle,
        features,
        rules,
        primaryImage: primaryImg,
        ownerName: vehicle.owner.name,
        ownerBusiness: vehicle.owner.ownerProfile?.businessName,
        isOwnerVerified: vehicle.owner.ownerProfile?.verificationStatus === 'approved',
      },
    });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

// 3. Owner Adds Vehicle
vehicleRouter.post('/', authMiddleware, requireRole(['owner', 'admin']), async (c) => {
  try {
    const authUser = c.get('user')!;
    const body = await c.req.json();
    const parsed = addVehicleSchema.safeParse(body);
    if (!parsed.success) {
      return c.json({ success: false, error: parsed.error.errors[0].message }, 400);
    }

    const db = getDb(c.env.DB);
    const existing = await db.query.vehicles.findFirst({
      where: eq(vehicles.registrationNumber, parsed.data.registrationNumber.toUpperCase()),
    });

    if (existing) {
      return c.json({ success: false, error: 'A vehicle with this registration plate is already listed' }, 409);
    }

    const vehicleId = crypto.randomUUID();
    const now = new Date().toISOString();

    await db.insert(vehicles).values({
      id: vehicleId,
      ownerId: authUser.userId,
      categoryId: parsed.data.categoryId,
      name: parsed.data.name,
      make: parsed.data.make,
      model: parsed.data.model,
      year: parsed.data.year,
      registrationNumber: parsed.data.registrationNumber.toUpperCase(),
      capacity: parsed.data.capacity,
      perDayPrice: parsed.data.perDayPrice,
      perEventPrice: parsed.data.perEventPrice,
      extraKmRate: parsed.data.extraKmRate,
      driverAllowance: parsed.data.driverAllowance,
      status: 'pending_approval', // Rule: Every newly submitted vehicle must remain pending until approved by admin
      city: parsed.data.city,
      district: parsed.data.district,
      address: parsed.data.address,
      description: parsed.data.description,
      featuresJson: JSON.stringify(parsed.data.features || []),
      rulesJson: JSON.stringify(parsed.data.rules || []),
      isFeatured: false,
      createdAt: now,
      updatedAt: now,
    });

    // Add images if provided
    if (parsed.data.images && parsed.data.images.length > 0) {
      for (let i = 0; i < parsed.data.images.length; i++) {
        await db.insert(vehicleImages).values({
          id: crypto.randomUUID(),
          vehicleId,
          imageUrl: parsed.data.images[i],
          isPrimary: i === 0,
          displayOrder: i,
          createdAt: now,
        });
      }
    }

    return c.json({
      success: true,
      message: 'Vehicle submitted successfully and is pending admin approval.',
      vehicleId,
    }, 201);
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

// 4. Owner Updates Vehicle
vehicleRouter.put('/:id', authMiddleware, requireRole(['owner', 'admin']), async (c) => {
  try {
    const authUser = c.get('user')!;
    const id = c.req.param('id');
    if (!id) {
      return c.json({ success: false, error: 'Vehicle ID required' }, 400);
    }
    const db = getDb(c.env.DB);

    const vehicle = await db.query.vehicles.findFirst({
      where: eq(vehicles.id, id),
    });

    if (!vehicle) {
      return c.json({ success: false, error: 'Vehicle not found' }, 404);
    }

    // Authorization check: Owner can only update their own vehicle!
    if (authUser.role !== 'admin' && vehicle.ownerId !== authUser.userId) {
      return c.json({ success: false, error: 'Forbidden. You do not own this vehicle.' }, 403);
    }

    const body = await c.req.json();
    const now = new Date().toISOString();

    const updates: any = {
      updatedAt: now,
    };

    if (body.name) updates.name = body.name;
    if (body.perDayPrice) updates.perDayPrice = body.perDayPrice;
    if (body.perEventPrice) updates.perEventPrice = body.perEventPrice;
    if (body.extraKmRate !== undefined) updates.extraKmRate = body.extraKmRate;
    if (body.driverAllowance !== undefined) updates.driverAllowance = body.driverAllowance;
    if (body.capacity) updates.capacity = body.capacity;
    if (body.city) updates.city = body.city;
    if (body.district) updates.district = body.district;
    if (body.address) updates.address = body.address;
    if (body.description) updates.description = body.description;
    if (body.features) updates.featuresJson = JSON.stringify(body.features);
    if (body.rules) updates.rulesJson = JSON.stringify(body.rules);

    await db.update(vehicles).set(updates).where(eq(vehicles.id, id));

    return c.json({ success: true, message: 'Vehicle updated successfully' });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

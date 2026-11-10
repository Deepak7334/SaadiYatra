import { Hono } from 'hono';
import { asc, eq } from 'drizzle-orm';
import { AppEnv } from '../middleware/auth';
import { getDb } from '../db/connection';
import { vehicleCategories, vehicles } from '../db/schema';

export const categoryRouter = new Hono<AppEnv>();

// Public categories list with active count
categoryRouter.get('/', async (c) => {
  try {
    const db = getDb(c.env.DB);
    const categories = await db.query.vehicleCategories.findMany({
      where: eq(vehicleCategories.isActive, true),
      orderBy: [asc(vehicleCategories.displayOrder)],
      with: {
        vehicles: {
          where: eq(vehicles.status, 'approved'),
        },
      },
    });

    const formatted = categories.map((cat) => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      description: cat.description,
      imageUrl: cat.imageUrl,
      iconName: cat.iconName,
      basePriceHint: cat.basePriceHint,
      vehicleCount: cat.vehicles.length,
    }));

    return c.json({ success: true, categories: formatted });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

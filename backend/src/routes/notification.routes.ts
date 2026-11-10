import { Hono } from 'hono';
import { eq, desc, and } from 'drizzle-orm';
import { AppEnv, authMiddleware } from '../middleware/auth';
import { getDb } from '../db/connection';
import { notifications } from '../db/schema';

export const notificationRouter = new Hono<AppEnv>();

notificationRouter.use('*', authMiddleware);

// 1. Get user notifications
notificationRouter.get('/', async (c) => {
  try {
    const authUser = c.get('user')!;
    const db = getDb(c.env.DB);

    const userNotifications = await db.query.notifications.findMany({
      where: eq(notifications.userId, authUser.userId),
      orderBy: [desc(notifications.createdAt)],
      limit: 50,
    });

    const unreadCount = userNotifications.filter((n) => !n.isRead).length;

    return c.json({
      success: true,
      notifications: userNotifications,
      unreadCount,
    });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

// 2. Mark notification as read
notificationRouter.put('/:id/read', async (c) => {
  try {
    const authUser = c.get('user')!;
    const id = c.req.param('id');
    if (!id) {
      return c.json({ success: false, error: 'Notification ID required' }, 400);
    }
    const db = getDb(c.env.DB);

    await db.update(notifications).set({
      isRead: true,
    }).where(
      and(
        eq(notifications.id, id),
        eq(notifications.userId, authUser.userId)
      )
    );

    return c.json({ success: true });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

// 3. Mark all as read
notificationRouter.put('/read-all', async (c) => {
  try {
    const authUser = c.get('user')!;
    const db = getDb(c.env.DB);

    await db.update(notifications).set({
      isRead: true,
    }).where(eq(notifications.userId, authUser.userId));

    return c.json({ success: true });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

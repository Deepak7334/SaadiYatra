import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { AppEnv } from './middleware/auth';
import { authRouter } from './routes/auth.routes';
import { vehicleRouter } from './routes/vehicle.routes';
import { categoryRouter } from './routes/category.routes';
import { availabilityRouter } from './routes/availability.routes';
import { bookingRouter } from './routes/booking.routes';
import { ownerRouter } from './routes/owner.routes';
import { adminRouter } from './routes/admin.routes';
import { paymentRouter } from './routes/payment.routes';
import { notificationRouter } from './routes/notification.routes';

const app = new Hono<AppEnv>();

// CORS middleware
app.use('*', cors({
  origin: (origin) => origin || '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposeHeaders: ['Content-Length'],
  credentials: true,
  maxAge: 86400,
}));

// Health check
app.get('/api/health', (c) => {
  return c.json({
    status: 'ok',
    service: 'ShaadiYatra API',
    version: '1.0.0',
    region: 'Bihar, India',
    timestamp: new Date().toISOString(),
  });
});

// Mount Routes
app.route('/api/auth', authRouter);
app.route('/api/vehicles', vehicleRouter);
app.route('/api/categories', categoryRouter);
app.route('/api/availability', availabilityRouter);
app.route('/api/bookings', bookingRouter);
app.route('/api/owner', ownerRouter);
app.route('/api/admin', adminRouter);
app.route('/api/payments', paymentRouter);
app.route('/api/notifications', notificationRouter);

// Global Error Handler
app.onError((err, c) => {
  console.error('API Error:', err);
  return c.json({
    success: false,
    error: err.message || 'Internal Server Error',
  }, 500);
});

// 404 Handler
app.notFound((c) => {
  return c.json({
    success: false,
    error: `Route not found: ${c.req.method} ${c.req.path}`,
  }, 404);
});

export default app;

import { Hono } from 'hono';
import { AppEnv, authMiddleware, requireRole } from '../middleware/auth';

export const uploadRouter = new Hono<AppEnv>();

/**
 * POST /api/upload/image
 * Accepts a multipart/form-data with field "file" (image).
 * Stores it in Cloudflare R2 and returns the public URL.
 * Only accessible by authenticated owners and admins.
 */
uploadRouter.post('/image', authMiddleware, requireRole(['owner', 'admin']), async (c) => {
  try {
    const storage = c.env.STORAGE;
    if (!storage) {
      return c.json({ success: false, error: 'Storage not configured' }, 503);
    }

    // Parse multipart form data
    const formData = await c.req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return c.json({ success: false, error: 'No file provided. Send field name "file".' }, 400);
    }

    // Validate type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return c.json({ success: false, error: 'Only JPEG, PNG, WebP and GIF images are allowed.' }, 400);
    }

    // 10 MB limit
    const MAX_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return c.json({ success: false, error: 'File is too large. Maximum size is 10 MB.' }, 400);
    }

    // Build unique key
    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const key = `vehicle-images/${crypto.randomUUID()}.${ext}`;

    const arrayBuffer = await file.arrayBuffer();

    // Upload to R2
    await storage.put(key, arrayBuffer, {
      httpMetadata: {
        contentType: file.type,
        cacheControl: 'public, max-age=31536000',
      },
    });

    // Build a public URL — in development this won't be a real CDN URL,
    // so we return a proxy URL through the Worker that serves R2 objects.
    const appUrl = c.env.APP_URL || 'http://localhost:8787';
    const publicUrl = `${appUrl}/api/upload/serve/${key}`;

    return c.json({
      success: true,
      url: publicUrl,
      key,
    });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

/**
 * GET /api/upload/serve/:path{.*}
 * Serves an R2 object by key (acts as a lightweight CDN proxy for local dev).
 */
uploadRouter.get('/serve/:path{.+}', async (c) => {
  try {
    const storage = c.env.STORAGE;
    if (!storage) {
      return c.json({ success: false, error: 'Storage not configured' }, 503);
    }

    const filePath = c.req.param('path');
    const key = `vehicle-images/${filePath.replace(/^vehicle-images\//, '')}`;

    const object = await storage.get(key);
    if (!object) {
      return c.json({ success: false, error: 'File not found' }, 404);
    }

    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set('etag', object.httpEtag);
    headers.set('cache-control', 'public, max-age=31536000');

    return new Response(object.body, { headers });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

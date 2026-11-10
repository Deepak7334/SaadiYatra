import { Context, Next } from 'hono';
import { verifyJwt, JwtPayload } from '../utils/crypto';

export interface AppEnv {
  Bindings: {
    DB: D1Database;
    STORAGE?: R2Bucket;
    JWT_SECRET: string;
    RAZORPAY_KEY_ID: string;
    RAZORPAY_KEY_SECRET: string;
    ENVIRONMENT: string;
    APP_URL: string;
  };
  Variables: {
    user?: JwtPayload;
  };
}

export async function authMiddleware(c: Context<AppEnv>, next: Next) {
  const authHeader = c.req.header('Authorization');
  let token: string | undefined;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  } else {
    // Check cookies
    const cookieHeader = c.req.header('Cookie');
    if (cookieHeader) {
      const match = cookieHeader.match(/shaadiyatra_token=([^;]+)/);
      if (match) {
        token = match[1];
      }
    }
  }

  if (!token) {
    return c.json({ success: false, error: 'Authentication required. No token provided.' }, 401);
  }

  const secret = c.env.JWT_SECRET || 'shaadiyatra_dev_secret_fallback';
  const payload = await verifyJwt(token, secret);

  if (!payload) {
    return c.json({ success: false, error: 'Invalid or expired token.' }, 401);
  }

  c.set('user', payload);
  await next();
}

export function optionalAuthMiddleware(c: Context<AppEnv>, next: Next) {
  const authHeader = c.req.header('Authorization');
  let token: string | undefined;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  }

  if (token) {
    const secret = c.env.JWT_SECRET || 'shaadiyatra_dev_secret_fallback';
    return verifyJwt(token, secret).then(payload => {
      if (payload) {
        c.set('user', payload);
      }
      return next();
    });
  }

  return next();
}

export function requireRole(allowedRoles: ('customer' | 'owner' | 'admin')[]) {
  return async (c: Context<AppEnv>, next: Next) => {
    const user = c.get('user');
    if (!user) {
      return c.json({ success: false, error: 'Unauthorized. Please login.' }, 401);
    }

    if (!allowedRoles.includes(user.role)) {
      return c.json({
        success: false,
        error: `Access denied. Requires one of roles: [${allowedRoles.join(', ')}]. Current role: ${user.role}`
      }, 403);
    }

    await next();
  };
}

import { Hono } from 'hono';
import { z } from 'zod';
import { eq, or } from 'drizzle-orm';
import { AppEnv, authMiddleware } from '../middleware/auth';
import { getDb } from '../db/connection';
import { users, customerProfiles, ownerProfiles } from '../db/schema';
import { hashPassword, verifyPassword, signJwt } from '../utils/crypto';

export const authRouter = new Hono<AppEnv>();

// Register Customer Schema
const registerCustomerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Valid 10-digit mobile number required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  city: z.string().optional(),
  district: z.string().optional(),
});

// Register Owner Schema
const registerOwnerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Valid 10-digit mobile number required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  businessName: z.string().optional(),
  address: z.string().min(5, 'Full address is required'),
  city: z.string().min(2, 'City is required'),
  district: z.string().min(2, 'District is required'),
  state: z.string().default('Bihar'),
  idDocumentType: z.string().default('Aadhaar'),
  idDocumentUrl: z.string().min(1, 'ID Document URL or details are required'),
});

// Login Schema
const loginSchema = z.object({
  identifier: z.string().min(3, 'Email or Phone number required'),
  password: z.string().min(1, 'Password required'),
});

// 1. Customer Registration
authRouter.post('/register-customer', async (c) => {
  try {
    const body = await c.req.json();
    const parsed = registerCustomerSchema.safeParse(body);
    if (!parsed.success) {
      return c.json({ success: false, error: parsed.error.errors[0].message }, 400);
    }

    const db = getDb(c.env.DB);
    const existing = await db.query.users.findFirst({
      where: or(eq(users.email, parsed.data.email), eq(users.phone, parsed.data.phone)),
    });

    if (existing) {
      return c.json({ success: false, error: 'User with this email or phone already exists' }, 409);
    }

    const userId = crypto.randomUUID();
    const profileId = crypto.randomUUID();
    const now = new Date().toISOString();
    const passwordHash = await hashPassword(parsed.data.password);

    await db.insert(users).values({
      id: userId,
      email: parsed.data.email.toLowerCase(),
      phone: parsed.data.phone,
      name: parsed.data.name,
      role: 'customer',
      passwordHash,
      status: 'active',
      isVerified: true,
      createdAt: now,
      updatedAt: now,
    });

    await db.insert(customerProfiles).values({
      id: profileId,
      userId,
      city: parsed.data.city || 'Patna',
      district: parsed.data.district || 'Patna',
      createdAt: now,
      updatedAt: now,
    });

    const token = await signJwt(
      { userId, email: parsed.data.email.toLowerCase(), role: 'customer', name: parsed.data.name },
      c.env.JWT_SECRET
    );

    return c.json({
      success: true,
      token,
      user: {
        id: userId,
        email: parsed.data.email.toLowerCase(),
        phone: parsed.data.phone,
        name: parsed.data.name,
        role: 'customer',
      },
    }, 201);
  } catch (err: any) {
    return c.json({ success: false, error: err.message || 'Registration failed' }, 500);
  }
});

// 2. Owner Registration
authRouter.post('/register-owner', async (c) => {
  try {
    const body = await c.req.json();
    const parsed = registerOwnerSchema.safeParse(body);
    if (!parsed.success) {
      return c.json({ success: false, error: parsed.error.errors[0].message }, 400);
    }

    const db = getDb(c.env.DB);
    const existing = await db.query.users.findFirst({
      where: or(eq(users.email, parsed.data.email), eq(users.phone, parsed.data.phone)),
    });

    if (existing) {
      return c.json({ success: false, error: 'User with this email or phone already exists' }, 409);
    }

    const userId = crypto.randomUUID();
    const profileId = crypto.randomUUID();
    const now = new Date().toISOString();
    const passwordHash = await hashPassword(parsed.data.password);

    await db.insert(users).values({
      id: userId,
      email: parsed.data.email.toLowerCase(),
      phone: parsed.data.phone,
      name: parsed.data.name,
      role: 'owner',
      passwordHash,
      status: 'active',
      isVerified: false, // Owners require KYC verification
      createdAt: now,
      updatedAt: now,
    });

    await db.insert(ownerProfiles).values({
      id: profileId,
      userId,
      businessName: parsed.data.businessName || `${parsed.data.name} Travels`,
      address: parsed.data.address,
      city: parsed.data.city,
      district: parsed.data.district,
      state: parsed.data.state || 'Bihar',
      idDocumentType: parsed.data.idDocumentType,
      idDocumentUrl: parsed.data.idDocumentUrl,
      verificationStatus: 'pending',
      createdAt: now,
      updatedAt: now,
    });

    const token = await signJwt(
      { userId, email: parsed.data.email.toLowerCase(), role: 'owner', name: parsed.data.name },
      c.env.JWT_SECRET
    );

    return c.json({
      success: true,
      token,
      user: {
        id: userId,
        email: parsed.data.email.toLowerCase(),
        phone: parsed.data.phone,
        name: parsed.data.name,
        role: 'owner',
        verificationStatus: 'pending',
      },
    }, 201);
  } catch (err: any) {
    return c.json({ success: false, error: err.message || 'Owner registration failed' }, 500);
  }
});

// 3. User Login
authRouter.post('/login', async (c) => {
  try {
    const body = await c.req.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return c.json({ success: false, error: parsed.error.errors[0].message }, 400);
    }

    const db = getDb(c.env.DB);
    const identifier = parsed.data.identifier.trim().toLowerCase();

    const user = await db.query.users.findFirst({
      where: or(eq(users.email, identifier), eq(users.phone, identifier)),
      with: {
        ownerProfile: true,
        customerProfile: true,
      },
    });

    if (!user) {
      return c.json({ success: false, error: 'Invalid credentials. User not found.' }, 401);
    }

    if (user.status === 'suspended') {
      return c.json({ success: false, error: 'Your account has been suspended. Please contact ShaadiYatra support.' }, 403);
    }

    const isValid = await verifyPassword(parsed.data.password, user.passwordHash);
    if (!isValid) {
      return c.json({ success: false, error: 'Invalid email/phone or password.' }, 401);
    }

    const token = await signJwt(
      { userId: user.id, email: user.email, role: user.role, name: user.name },
      c.env.JWT_SECRET
    );

    return c.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        name: user.name,
        role: user.role,
        status: user.status,
        isVerified: user.isVerified,
        ownerProfile: user.ownerProfile,
        customerProfile: user.customerProfile,
      },
    });
  } catch (err: any) {
    return c.json({ success: false, error: err.message || 'Login failed' }, 500);
  }
});

// 4. Current User Session Check
authRouter.get('/me', authMiddleware, async (c) => {
  const authUser = c.get('user');
  if (!authUser) {
    return c.json({ success: false, error: 'Unauthorized' }, 401);
  }

  const db = getDb(c.env.DB);
  const user = await db.query.users.findFirst({
    where: eq(users.id, authUser.userId),
    with: {
      ownerProfile: true,
      customerProfile: true,
    },
  });

  if (!user) {
    return c.json({ success: false, error: 'User not found' }, 404);
  }

  return c.json({
    success: true,
    user: {
      id: user.id,
      email: user.email,
      phone: user.phone,
      name: user.name,
      role: user.role,
      status: user.status,
      isVerified: user.isVerified,
      ownerProfile: user.ownerProfile,
      customerProfile: user.customerProfile,
    },
  });
});

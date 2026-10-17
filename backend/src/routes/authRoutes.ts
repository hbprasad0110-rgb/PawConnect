import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { db } from '../db/connection.ts';
import { appConfig } from '../config/constants.ts';
import { asyncHandler, ApiError } from '../core/errors.ts';
import { cookieOptions, requireAuth, requireRole, signToken } from '../core/auth.ts';
import { validateBody } from '../core/validate.ts';
import { serialize } from '../core/serializers.ts';

const router = Router();
const registerSchema = z.object({
  name: z.string().trim().min(2).optional(),
  firstName: z.string().trim().min(1).optional(),
  lastName: z.string().trim().min(1).optional(),
  email: z.string().email(),
  phone: z.string().trim().min(7),
  address: z.string().trim().min(5),
  password: z.string().min(8).max(100)
}).refine((value) => value.name || (value.firstName && value.lastName), { message: 'Name is required.' });
const loginSchema = z.object({ email: z.string().email(), password: z.string().min(1) });
const profileSchema = z.object({ firstName: z.string().trim().min(1), lastName: z.string().trim().min(1), phone: z.string().trim().min(7), address: z.string().trim().min(5) });

router.post('/register', validateBody(registerSchema), asyncHandler(async (req, res) => {
  const existing = await db('users').whereRaw('LOWER(email) = ?', [req.body.email.toLowerCase()]).first();
  if (existing) throw new ApiError(409, 'CONFLICT', 'An account with this email already exists.');
  const nameParts = String(req.body.name || '').trim().split(/\s+/);
  const firstName = req.body.firstName || nameParts.shift();
  const lastName = req.body.lastName || nameParts.join(' ') || 'User';
  const [id] = await db('users').insert({
    first_name: firstName, last_name: lastName, email: req.body.email.toLowerCase(),
    phone: req.body.phone, address: req.body.address,
    password_hash: await bcrypt.hash(req.body.password, 12), role: 'adopter'
  });
  const user = await db('users').where({ id }).first();
  res.cookie(appConfig.auth.cookieName, signToken({ id, role: 'adopter' }), cookieOptions).status(201).json({ data: serialize(user) });
}));

router.post('/login', validateBody(loginSchema), asyncHandler(async (req, res) => {
  const user = await db('users').whereRaw('LOWER(email) = ?', [req.body.email.toLowerCase()]).first();
  if (!user || !(await bcrypt.compare(req.body.password, user.password_hash))) {
    throw new ApiError(401, 'UNAUTHENTICATED', 'Invalid email or password.');
  }
  res.cookie(appConfig.auth.cookieName, signToken({ id: Number(user.id), role: user.role }), cookieOptions).json({ data: serialize(user) });
}));

router.post('/logout', requireAuth, (_req, res) => {
  res.clearCookie(appConfig.auth.cookieName, { ...cookieOptions, maxAge: undefined }).json({ data: { loggedOut: true } });
});

router.get('/me', requireAuth, asyncHandler(async (req, res) => {
  const user = await db('users').where({ id: req.user!.id }).first();
  if (!user) throw new ApiError(404, 'NOT_FOUND', 'User not found.');
  res.json({ data: serialize(user) });
}));

router.get('/profile', requireAuth, requireRole('adopter'), asyncHandler(async (req, res) => {
  const user = await db('users').where({ id: req.user!.id }).first();
  if (!user) throw new ApiError(404, 'NOT_FOUND', 'User not found.');
  res.json({ data: serialize(user) });
}));

router.put('/profile', requireAuth, requireRole('adopter'), validateBody(profileSchema), asyncHandler(async (req, res) => {
  await db('users').where({ id: req.user!.id }).update({ first_name: req.body.firstName, last_name: req.body.lastName, phone: req.body.phone, address: req.body.address, updated_at: db.fn.now() });
  const user = await db('users').where({ id: req.user!.id }).first();
  if (!user) throw new ApiError(404, 'NOT_FOUND', 'User not found.');
  res.json({ data: serialize(user) });
}));

export default router;

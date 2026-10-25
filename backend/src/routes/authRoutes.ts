import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { createHash, randomBytes } from 'node:crypto';
import { z } from 'zod';
import { db } from '../db/connection.ts';
import { appConfig } from '../config/constants.ts';
import { asyncHandler, ApiError } from '../core/errors.ts';
import { cookieOptions, requireAuth, requireRole, signToken } from '../core/auth.ts';
import { validateBody } from '../core/validate.ts';
import { serialize } from '../core/serializers.ts';
import { sendPasswordResetEmail, sendWelcomeEmail } from '../services/emailService.ts';

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
const forgotPasswordSchema = z.object({ email: z.string().email() });
const resetPasswordSchema = z.object({ token: z.string().min(32).max(200), password: z.string().min(8).max(100) });
const forgotPasswordMessage = 'If an account exists for that email, a password reset link has been sent.';
const tokenHash = (token: string) => createHash('sha256').update(token).digest('hex');

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
  await sendWelcomeEmail({ email: user.email, firstName: user.first_name });
  res.cookie(appConfig.auth.cookieName, signToken({ id, role: 'adopter' }), cookieOptions).status(201).json({ data: serialize(user) });
}));

router.post('/login', validateBody(loginSchema), asyncHandler(async (req, res) => {
  const user = await db('users').whereRaw('LOWER(email) = ?', [req.body.email.toLowerCase()]).first();
  if (!user || !(await bcrypt.compare(req.body.password, user.password_hash))) {
    throw new ApiError(401, 'UNAUTHENTICATED', 'Invalid email or password.');
  }
  res.cookie(appConfig.auth.cookieName, signToken({ id: Number(user.id), role: user.role }), cookieOptions).json({ data: serialize(user) });
}));

router.post('/forgot-password', validateBody(forgotPasswordSchema), asyncHandler(async (req, res) => {
  const user = await db('users').whereRaw('LOWER(email) = ?', [req.body.email.toLowerCase()]).first();
  if (!user) {
    res.json({ data: { message: forgotPasswordMessage } });
    return;
  }

  const cooldownSeconds = Math.floor(appConfig.auth.passwordResetCooldownMs / 1000);
  const recentRequest = await db('password_reset_tokens')
    .where({ user_id: user.id })
    .where('created_at', '>', db.raw('DATE_SUB(CURRENT_TIMESTAMP, INTERVAL ? SECOND)', [cooldownSeconds]))
    .first();

  if (!recentRequest) {
    const token = randomBytes(32).toString('hex');
    const resetTokenHash = tokenHash(token);
    await db.transaction(async (trx) => {
      await trx('password_reset_tokens').where({ user_id: user.id }).whereNull('used_at').delete();
      await trx('password_reset_tokens').insert({
        user_id: user.id,
        token_hash: resetTokenHash,
        expires_at: trx.raw('DATE_ADD(CURRENT_TIMESTAMP, INTERVAL ? SECOND)', [Math.floor(appConfig.auth.passwordResetLifetimeMs / 1000)]),
      });
    });
    const delivered = await sendPasswordResetEmail({ email: user.email, firstName: user.first_name, token });
    if (!delivered) {
      await db('password_reset_tokens').where({ token_hash: resetTokenHash }).delete();
      throw new ApiError(503, 'EMAIL_DELIVERY_FAILED', 'The reset email could not be sent. Please try again later or contact PawConnect support.');
    }
  }

  res.json({ data: { message: forgotPasswordMessage } });
}));

router.post('/reset-password', validateBody(resetPasswordSchema), asyncHandler(async (req, res) => {
  await db.transaction(async (trx) => {
    const resetToken = await trx('password_reset_tokens')
      .where({ token_hash: tokenHash(req.body.token) })
      .whereNull('used_at')
      .where('expires_at', '>', trx.fn.now())
      .forUpdate()
      .first();
    if (!resetToken) {
      throw new ApiError(400, 'INVALID_RESET_TOKEN', 'This password reset link is invalid or has expired.');
    }

    await trx('users').where({ id: resetToken.user_id }).update({
      password_hash: await bcrypt.hash(req.body.password, 12),
      updated_at: trx.fn.now(),
    });
    await trx('password_reset_tokens').where({ user_id: resetToken.user_id }).whereNull('used_at').update({ used_at: trx.fn.now() });
  });

  res.clearCookie(appConfig.auth.cookieName, { ...cookieOptions, maxAge: undefined }).json({
    data: { message: 'Your password has been reset. You can now sign in with your new password.' },
  });
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

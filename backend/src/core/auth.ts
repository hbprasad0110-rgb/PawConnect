import type { RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import { appConfig } from '../config/constants.ts';
import { env } from '../config/env.ts';
import { ApiError } from './errors.ts';

export type Role = 'adopter' | 'admin';
export interface AuthUser { id: number; role: Role; }

declare global {
  namespace Express {
    interface Request { user?: AuthUser; }
  }
}

export const signToken = (user: AuthUser) =>
  jwt.sign({ role: user.role }, env.JWT_SECRET, { subject: String(user.id), expiresIn: appConfig.auth.tokenLifetime });

export const requireAuth: RequestHandler = (req, _res, next) => {
  const token = req.cookies?.[appConfig.auth.cookieName];
  if (!token) return next(new ApiError(401, 'UNAUTHENTICATED', 'Authentication is required.'));
  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as jwt.JwtPayload;
    req.user = { id: Number(payload.sub), role: payload.role as Role };
    next();
  } catch {
    next(new ApiError(401, 'UNAUTHENTICATED', 'The session is invalid or expired.'));
  }
};

export const requireRole = (role: Role): RequestHandler => (req, _res, next) => {
  if (req.user?.role !== role) return next(new ApiError(403, 'FORBIDDEN', `${role} access is required.`));
  next();
};

export const cookieOptions = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: env.NODE_ENV === 'production',
  maxAge: appConfig.auth.sessionDurationMs,
  path: '/'
};

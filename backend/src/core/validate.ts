import type { RequestHandler } from 'express';
import type { ZodType } from 'zod';
import { validationError } from './errors.ts';

export const validateBody = (schema: ZodType): RequestHandler => (req, _res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) return next(validationError(result.error.issues));
  req.body = result.data;
  next();
};

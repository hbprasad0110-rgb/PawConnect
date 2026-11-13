import type { ErrorRequestHandler, RequestHandler } from 'express';
import type { ZodIssue } from 'zod';

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public details?: unknown
  ) {
    super(message);
  }
}

export const asyncHandler = (handler: RequestHandler): RequestHandler =>
  (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);

export const notFoundHandler: RequestHandler = (_req, _res, next) =>
  next(new ApiError(404, 'NOT_FOUND', 'Route not found.'));

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error?.type === 'entity.parse.failed') {
    res.status(400).json({ error: { code: 'INVALID_JSON', message: 'Request body must contain valid JSON.' } });
    return;
  }

  if (error instanceof ApiError) {
    res.status(error.status).json({ error: { code: error.code, message: error.message, details: error.details } });
    return;
  }

  if (error?.code === 'ER_DUP_ENTRY') {
    res.status(409).json({ error: { code: 'CONFLICT', message: 'A record with these values already exists.' } });
    return;
  }

  console.error(error);
  res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'An unexpected server error occurred.' } });
};

export const validationError = (issues: ZodIssue[]) =>
  new ApiError(400, 'VALIDATION_ERROR', 'Request validation failed.', issues);

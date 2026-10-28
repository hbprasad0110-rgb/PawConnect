import assert from 'node:assert/strict';
import express from 'express';
import { describe, it } from 'node:test';
import request from 'supertest';
import { ApiError, asyncHandler, errorHandler, notFoundHandler } from '../src/core/errors.ts';

const createApp = () => {
  const app = express();
  app.get('/async-error', asyncHandler(async () => {
    throw new ApiError(409, 'INVALID_STATE', 'This transition is not allowed.');
  }));
  app.get('/duplicate', (_req, _res, next) => next({ code: 'ER_DUP_ENTRY' }));
  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
};

describe('API error handling', () => {
  it('preserves expected API error status and details', async () => {
    const response = await request(createApp()).get('/async-error');

    assert.equal(response.status, 409);
    assert.deepEqual(response.body.error, {
      code: 'INVALID_STATE',
      message: 'This transition is not allowed.',
    });
  });

  it('maps database uniqueness errors to conflict responses', async () => {
    const response = await request(createApp()).get('/duplicate');

    assert.equal(response.status, 409);
    assert.equal(response.body.error.code, 'CONFLICT');
  });

  it('returns the standard response for unknown routes', async () => {
    const response = await request(createApp()).get('/missing');

    assert.equal(response.status, 404);
    assert.equal(response.body.error.code, 'NOT_FOUND');
  });
});

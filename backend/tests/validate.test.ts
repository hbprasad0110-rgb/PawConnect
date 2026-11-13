import assert from 'node:assert/strict';
import express from 'express';
import { describe, it } from 'node:test';
import request from 'supertest';
import { z } from 'zod';
import { errorHandler } from '../src/core/errors.ts';
import { validateBody } from '../src/core/validate.ts';

const schema = z.object({
  name: z.string().trim().min(2),
  ageMonths: z.coerce.number().int().nonnegative(),
});

const createApp = () => {
  const app = express();
  app.use(express.json());
  app.post('/validated', validateBody(schema), (req, res) => res.json({ data: req.body }));
  app.use(errorHandler);
  return app;
};

describe('request body validation middleware', () => {
  it('uses the parsed and transformed schema values', async () => {
    const response = await request(createApp()).post('/validated')
      .send({ name: '  Daisy  ', ageMonths: '18' });

    assert.equal(response.status, 200);
    assert.deepEqual(response.body.data, { name: 'Daisy', ageMonths: 18 });
  });

  it('returns a structured validation error and does not invoke the route', async () => {
    const response = await request(createApp()).post('/validated')
      .send({ name: 'D', ageMonths: -1 });

    assert.equal(response.status, 400);
    assert.equal(response.body.error.code, 'VALIDATION_ERROR');
    assert.equal(response.body.error.message, 'Request validation failed.');
    assert.ok(Array.isArray(response.body.error.details));
    assert.ok(response.body.error.details.length >= 2);
  });
});

import assert from 'node:assert/strict';
import cookieParser from 'cookie-parser';
import express from 'express';
import { describe, it } from 'node:test';
import request from 'supertest';
import { appConfig } from '../src/config/constants.ts';
import { errorHandler } from '../src/core/errors.ts';
import { requireAuth, requireRole, signToken } from '../src/core/auth.ts';

const createApp = () => {
  const app = express();
  app.use(cookieParser());
  app.get('/protected', requireAuth, (req, res) => res.json({ data: req.user }));
  app.get('/admin', requireAuth, requireRole('admin'), (req, res) => res.json({ data: req.user }));
  app.use(errorHandler);
  return app;
};

const sessionCookie = (id: number, role: 'adopter' | 'admin') =>
  `${appConfig.auth.cookieName}=${signToken({ id, role })}`;

describe('authentication middleware', () => {
  it('rejects missing and invalid session cookies', async () => {
    const app = createApp();

    const missing = await request(app).get('/protected');
    assert.equal(missing.status, 401);
    assert.equal(missing.body.error.code, 'UNAUTHENTICATED');

    const invalid = await request(app).get('/protected')
      .set('Cookie', `${appConfig.auth.cookieName}=not-a-valid-token`);
    assert.equal(invalid.status, 401);
    assert.equal(invalid.body.error.code, 'UNAUTHENTICATED');
  });

  it('attaches the authenticated user and enforces roles', async () => {
    const app = createApp();

    const adopterSession = await request(app).get('/protected')
      .set('Cookie', sessionCookie(21, 'adopter'));
    assert.equal(adopterSession.status, 200);
    assert.deepEqual(adopterSession.body.data, { id: 21, role: 'adopter' });

    const forbidden = await request(app).get('/admin')
      .set('Cookie', sessionCookie(21, 'adopter'));
    assert.equal(forbidden.status, 403);
    assert.equal(forbidden.body.error.code, 'FORBIDDEN');

    const adminSession = await request(app).get('/admin')
      .set('Cookie', sessionCookie(1, 'admin'));
    assert.equal(adminSession.status, 200);
    assert.deepEqual(adminSession.body.data, { id: 1, role: 'admin' });
  });
});

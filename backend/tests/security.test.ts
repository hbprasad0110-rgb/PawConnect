import assert from 'node:assert/strict';
import { it } from 'node:test';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { app } from '../src/app.ts';
import { appConfig } from '../src/config/constants.ts';
import { env } from '../src/config/env.ts';

it('sets security headers and hides server implementation', async () => {
  const response = await request(app).get('/api/health');
  assert.equal(response.status, 200);
  assert.equal(response.headers['x-content-type-options'], 'nosniff');
  assert.equal(response.headers['x-frame-options'], 'SAMEORIGIN');
  assert.ok(response.headers['content-security-policy']);
  assert.equal(response.headers['x-powered-by'], undefined);
});
it('does not grant CORS access to an untrusted origin', async () => {
  const response = await request(app).get('/api/health').set('Origin', 'https://attacker.invalid');
  assert.notEqual(response.headers['access-control-allow-origin'], 'https://attacker.invalid');
});
for (const path of ['/api/admin/summary', '/api/applications/mine', '/api/appointments/mine', '/api/auth/profile']) {
  it(`rejects anonymous requests to ${path}`, async () => {
    const response = await request(app).get(path);
    assert.equal(response.status, 401);
    assert.equal(response.body.error.code, 'UNAUTHENTICATED');
  });
}
for (const [label, token] of [
  ['expired', jwt.sign({ role: 'admin', sub: '1', exp: 1 }, env.JWT_SECRET)],
  ['forged', jwt.sign({ role: 'admin', sub: '1' }, 'attacker-secret')],
] as const) {
  it(`rejects ${label} session tokens`, async () => {
    const response = await request(app).get('/api/admin/summary').set('Cookie', `${appConfig.auth.cookieName}=${token}`);
    assert.equal(response.status, 401);
  });
}
it('malformed JSON returns a client error without internal details', async () => {
  const response = await request(app).post('/api/auth/login').set('Content-Type', 'application/json').send('{');
  assert.equal(response.status, 400);
  assert.equal(response.body.error.code, 'INVALID_JSON');
  assert.equal(JSON.stringify(response.body).includes('SyntaxError'), false);
});

for (const [label, method, path, body] of [
  ['invalid login credentials shape', 'post', '/api/auth/login', { email: 'not-an-email', password: '' }],
  ['incomplete registration payload', 'post', '/api/auth/register', { email: 'missing-fields@example.test' }],
  ['invalid forgot-password email', 'post', '/api/auth/forgot-password', { email: 'not-an-email' }],
  ['too-short password reset token', 'post', '/api/auth/reset-password', { token: 'short', password: 'Password123!' }],
] as const) {
  it(`rejects ${label} before reaching protected business logic`, async () => {
    const response = await request(app)[method](path).send(body);
    assert.equal(response.status, 400);
    assert.equal(response.body.error.code, 'VALIDATION_ERROR');
  });
}

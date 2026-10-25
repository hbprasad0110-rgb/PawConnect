import assert from 'node:assert/strict';
import { after, describe, it } from 'node:test';
import request from 'supertest';
import { app } from '../src/app.ts';
import { env } from '../src/config/env.ts';
import { db } from '../src/db/connection.ts';

const futureShelterDate = () => {
  const value = new Date();
  value.setDate(value.getDate() + 3);
  while (value.getDay() === 0) value.setDate(value.getDate() + 1);
  value.setHours(12, 0, 0, 0);
  return value;
};

describe('PawConnect API workflow', () => {
  after(async () => db.destroy());

  it('integrates registration, filtering, review, appointment, and adoption flows', async () => {
    const adopter = request.agent(app);
    const admin = request.agent(app);

    const unauthorized = await request(app).get('/api/admin/summary');
    assert.equal(unauthorized.status, 401);

    const animals = await request(app).get('/api/animals').query({ includeAdopted: true, pageSize: 20 });
    assert.equal(animals.status, 200);
    assert.equal(animals.body.meta.total, 12);

    const filtered = await request(app).get('/api/animals').query({ breed: 'Beagle', minAgeMonths: 60, includeAdopted: true });
    assert.equal(filtered.status, 200);
    assert.deepEqual(filtered.body.data.map((animal: { name: string }) => animal.name), ['Daisy']);

    const adopted = await request(app).get('/api/animals').query({ status: 'adopted', includeAdopted: true });
    assert.equal(adopted.status, 200);
    assert.equal(adopted.body.data[0].name, 'Oliver');

    const registration = await adopter.post('/api/auth/register').send({
      name: 'Integration User', email: 'integration@pawconnect.test', password: 'Integration123!',
      phone: '(555) 987-6543', address: '100 Test Lane, Arlington, TX 76010',
    });
    assert.equal(registration.status, 201);
    assert.equal(registration.body.data.role, 'adopter');

    const buddy = animals.body.data.find((animal: { name: string }) => animal.name === 'Buddy');
    assert.ok(buddy);
    const application = await adopter.post('/api/applications').send({
      animalId: buddy.id,
      reason: 'Buddy is a strong match for our active and caring household.',
      experience: 'Ten years caring for family dogs.',
      livingArrangement: 'House with a secure fenced yard',
      hasYard: true,
      hasOtherPets: false,
      otherPetsDescription: '',
      employmentStatus: 'Full-time employed',
      references: 'Jordan Smith, (555) 222-3333',
    });
    assert.equal(application.status, 201);

    const adminLogin = await admin.post('/api/auth/login').send({ email: env.ADMIN_EMAIL, password: env.ADMIN_PASSWORD });
    assert.equal(adminLogin.status, 200);
    assert.equal(adminLogin.body.data.role, 'admin');

    const note = 'Approved after reference and housing review.';
    const decision = await admin.patch(`/api/admin/applications/${application.body.data.id}/decision`).send({ decision: 'approved', decisionNote: note });
    assert.equal(decision.status, 200);
    assert.equal(decision.body.data.decisionNote, note);

    const mine = await adopter.get('/api/applications/mine');
    assert.equal(mine.status, 200);
    assert.equal(mine.body.data[0].decisionNote, note);

    const startsAt = futureShelterDate();
    const appointment = await adopter.post('/api/appointments').send({
      applicationId: application.body.data.id,
      startsAt: startsAt.toISOString(),
      notes: 'Please allow extra time for family introductions.',
    });
    assert.equal(appointment.status, 201);
    assert.equal(appointment.body.data.status, 'requested');

    const date = startsAt.toISOString().slice(0, 10);
    const requested = await admin.get('/api/admin/appointments').query({ status: 'requested', date, animalId: buddy.id });
    assert.equal(requested.status, 200);
    assert.equal(requested.body.data.length, 1);

    const confirmed = await admin.patch(`/api/admin/appointments/${appointment.body.data.id}/status`).send({ status: 'confirmed' });
    assert.equal(confirmed.status, 200);
    assert.equal(confirmed.body.data.status, 'confirmed');

    const completed = await admin.patch(`/api/admin/appointments/${appointment.body.data.id}/status`).send({ status: 'completed' });
    assert.equal(completed.status, 200);
    assert.equal(completed.body.data.status, 'completed');

    const invalidTransition = await admin.patch(`/api/admin/appointments/${appointment.body.data.id}/status`).send({ status: 'confirmed' });
    assert.equal(invalidTransition.status, 409);

    const adoption = await admin.post(`/api/admin/applications/${application.body.data.id}/complete-adoption`).send({
      adoptedOn: date,
      notes: 'All handoff checklist items were completed.',
    });
    assert.equal(adoption.status, 201);
    assert.equal(adoption.body.data.notes, 'All handoff checklist items were completed.');

    const history = await admin.get('/api/admin/adoptions');
    assert.equal(history.status, 200);
    assert.ok(history.body.data.some((record: { applicationId: number }) => record.applicationId === application.body.data.id));

    const medical = await admin.get(`/api/admin/animals/${buddy.id}/medical-records`);
    assert.equal(medical.status, 200);
    assert.ok(medical.body.data.some((record: { notes?: string }) => record.notes === 'Cleared for adoption.'));
  });
});

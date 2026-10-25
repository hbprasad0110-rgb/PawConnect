import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
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
    const otherAdopter = request.agent(app);

    const unauthorized = await request(app).get('/api/admin/summary');
    assert.equal(unauthorized.status, 401);

    const invalidLogin = await request(app).post('/api/auth/login').send({ email: env.DEMO_ADOPTER_EMAIL, password: 'incorrect-password' });
    assert.equal(invalidLogin.status, 401);

    const animals = await request(app).get('/api/animals').query({ includeAdopted: true, pageSize: 20 });
    assert.equal(animals.status, 200);
    assert.equal(animals.body.meta.total, 12);

    const publicSummary = await request(app).get('/api/animals/stats/summary');
    assert.equal(publicSummary.status, 200);
    assert.equal(typeof publicSummary.body.data.availableAnimals, 'number');

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

    const duplicateRegistration = await adopter.post('/api/auth/register').send({
      name: 'Duplicate Integration User', email: 'integration@pawconnect.test', password: 'Integration123!',
      phone: '(555) 987-6543', address: '100 Test Lane, Arlington, TX 76010',
    });
    assert.equal(duplicateRegistration.status, 409);

    const unknownResetRequest = await request(app).post('/api/auth/forgot-password').send({ email: 'unknown@pawconnect.test' });
    assert.equal(unknownResetRequest.status, 200);
    const resetRequest = await request(app).post('/api/auth/forgot-password').send({ email: 'integration@pawconnect.test' });
    assert.equal(resetRequest.status, 200);
    assert.equal(resetRequest.body.data.message, unknownResetRequest.body.data.message);
    const resetTokenRows = await db('password_reset_tokens').where({ user_id: registration.body.data.id });
    assert.equal(resetTokenRows.length, 1);
    assert.equal(resetTokenRows[0].token_hash.length, 64);

    const repeatedRequest = await request(app).post('/api/auth/forgot-password').send({ email: 'integration@pawconnect.test' });
    assert.equal(repeatedRequest.status, 200);
    assert.equal(await db('password_reset_tokens').where({ user_id: registration.body.data.id }).count({ count: '*' }).first().then((row) => Number(row?.count)), 1);

    const knownToken = 'integration-password-reset-token-value-1234567890';
    await db('password_reset_tokens').where({ user_id: registration.body.data.id }).delete();
    await db('password_reset_tokens').insert({
      user_id: registration.body.data.id,
      token_hash: createHash('sha256').update(knownToken).digest('hex'),
      expires_at: new Date(Date.now() + 10 * 60 * 1000),
    });
    const storedResetToken = await db('password_reset_tokens').where({ user_id: registration.body.data.id }).first();
    assert.equal(storedResetToken.token_hash, createHash('sha256').update(knownToken).digest('hex'));
    assert.ok(new Date(storedResetToken.expires_at).getTime() > Date.now());
    const invalidReset = await request(app).post('/api/auth/reset-password').send({ token: 'invalid-password-reset-token-value-1234567890', password: 'ChangedPassword123!' });
    assert.equal(invalidReset.status, 400);
    const validReset = await request(app).post('/api/auth/reset-password').send({ token: knownToken, password: 'ChangedPassword123!' });
    assert.equal(validReset.status, 200, JSON.stringify(validReset.body));
    const reusedReset = await request(app).post('/api/auth/reset-password').send({ token: knownToken, password: 'AnotherPassword123!' });
    assert.equal(reusedReset.status, 400);
    const oldPasswordLogin = await request(app).post('/api/auth/login').send({ email: 'integration@pawconnect.test', password: 'Integration123!' });
    assert.equal(oldPasswordLogin.status, 401);
    const changedPasswordLogin = await request(app).post('/api/auth/login').send({ email: 'integration@pawconnect.test', password: 'ChangedPassword123!' });
    assert.equal(changedPasswordLogin.status, 200);

    const forbiddenAdmin = await adopter.get('/api/admin/summary');
    assert.equal(forbiddenAdmin.status, 403);

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

    const duplicateApplication = await adopter.post('/api/applications').send({
      animalId: buddy.id,
      reason: 'This duplicate application must be rejected by the API.',
      experience: 'Ten years caring for family dogs.', livingArrangement: 'House with a secure fenced yard',
      hasYard: true, hasOtherPets: false, otherPetsDescription: '', employmentStatus: 'Full-time employed',
      references: 'Jordan Smith, (555) 222-3333',
    });
    assert.equal(duplicateApplication.status, 409);

    const otherLogin = await otherAdopter.post('/api/auth/login').send({ email: env.DEMO_ADOPTER_EMAIL, password: env.DEMO_ADOPTER_PASSWORD });
    assert.equal(otherLogin.status, 200);
    const forbiddenApplication = await otherAdopter.get(`/api/applications/${application.body.data.id}`);
    assert.equal(forbiddenApplication.status, 403);
    const competingApplication = await otherAdopter.post('/api/applications').send({
      animalId: buddy.id,
      reason: 'Buddy would be welcomed into a stable and attentive household.',
      experience: 'Several years caring for adopted dogs.', livingArrangement: 'House with a fenced yard',
      hasYard: true, hasOtherPets: false, otherPetsDescription: '', employmentStatus: 'Full-time employed',
      references: 'Morgan Lee, (555) 444-5555',
    });
    assert.equal(competingApplication.status, 201);

    const adminLogin = await admin.post('/api/auth/login').send({ email: env.ADMIN_EMAIL, password: env.ADMIN_PASSWORD });
    assert.equal(adminLogin.status, 200);
    assert.equal(adminLogin.body.data.role, 'admin');

    await assert.rejects(
      db('users').insert({
        first_name: 'Second', last_name: 'Admin', email: 'second-admin@pawconnect.test', phone: '(555) 000-9999',
        address: 'PawConnect Test Office', password_hash: 'not-a-login-password', role: 'admin',
      }),
      (error: { code?: string; sqlMessage?: string }) => error.code === 'ER_DUP_ENTRY' && String(error.sqlMessage).includes('users_single_admin'),
    );

    const rocky = animals.body.data.find((animal: { name: string }) => animal.name === 'Rocky');
    const luna = animals.body.data.find((animal: { name: string }) => animal.name === 'Luna');
    assert.ok(rocky && luna);

    const secondApplication = await adopter.post('/api/applications').send({
      animalId: rocky.id, reason: 'Rocky would thrive in our active household and secure yard.',
      experience: 'Ten years caring for family dogs.', livingArrangement: 'House with a secure fenced yard',
      hasYard: true, hasOtherPets: false, otherPetsDescription: '', employmentStatus: 'Full-time employed',
      references: 'Jordan Smith, (555) 222-3333',
    });
    assert.equal(secondApplication.status, 201);

    const rejectedApplication = await adopter.post('/api/applications').send({
      animalId: luna.id, reason: 'Luna would have a calm and attentive home with our family.',
      experience: 'Five years caring for cats.', livingArrangement: 'Quiet apartment with landlord approval',
      hasYard: false, hasOtherPets: false, otherPetsDescription: '', employmentStatus: 'Full-time employed',
      references: 'Taylor Smith, (555) 222-4444',
    });
    assert.equal(rejectedApplication.status, 201);

    const note = 'Approved after reference and housing review.';
    const decision = await admin.patch(`/api/admin/applications/${application.body.data.id}/decision`).send({ decision: 'approved', decisionNote: note });
    assert.equal(decision.status, 200);
    assert.equal(decision.body.data.decisionNote, note);
    const otherApplications = await otherAdopter.get('/api/applications/mine');
    const autoRejected = otherApplications.body.data.find((item: { id: number }) => item.id === competingApplication.body.data.id);
    assert.equal(autoRejected.status, 'rejected');
    assert.equal(autoRejected.decisionNote, 'Another application was approved.');

    const secondDecision = await admin.patch(`/api/admin/applications/${secondApplication.body.data.id}/decision`).send({ decision: 'approved', decisionNote: 'Approved for conflict validation.' });
    assert.equal(secondDecision.status, 200);

    const rejection = await admin.patch(`/api/admin/applications/${rejectedApplication.body.data.id}/decision`).send({ decision: 'rejected', decisionNote: 'Current housing is not a match.' });
    assert.equal(rejection.status, 200);
    const lunaAfterRejection = await request(app).get(`/api/animals/${luna.id}`);
    assert.equal(lunaAfterRejection.body.data.status, 'available');

    const mine = await adopter.get('/api/applications/mine');
    assert.equal(mine.status, 200);
    const approvedApplication = mine.body.data.find((item: { id: number }) => item.id === application.body.data.id);
    assert.equal(approvedApplication.decisionNote, note);

    const startsAt = futureShelterDate();
    const appointment = await adopter.post('/api/appointments').send({
      applicationId: application.body.data.id,
      startsAt: startsAt.toISOString(),
      purpose: 'Family meet and greet',
      notes: 'Please allow extra time for family introductions.',
    });
    assert.equal(appointment.status, 201);
    assert.equal(appointment.body.data.status, 'requested');
    assert.equal(appointment.body.data.purpose, 'Family meet and greet');

    const overlappingAppointment = await adopter.post('/api/appointments').send({
      applicationId: secondApplication.body.data.id,
      startsAt: startsAt.toISOString(),
      purpose: 'Second meet and greet',
      notes: '',
    });
    assert.equal(overlappingAppointment.status, 409);

    const withdrawn = await adopter.patch(`/api/applications/${secondApplication.body.data.id}/withdraw`);
    assert.equal(withdrawn.status, 200);
    assert.equal(withdrawn.body.data.status, 'withdrawn');
    const rockyAfterWithdrawal = await request(app).get(`/api/animals/${rocky.id}`);
    assert.equal(rockyAfterWithdrawal.body.data.status, 'available');

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

    const statusHistory = await admin.get(`/api/admin/animals/${buddy.id}/status-history`);
    assert.equal(statusHistory.status, 200);
    assert.ok(statusHistory.body.data.some((entry: { notes?: string }) => entry.notes === 'All handoff checklist items were completed.'));

    const adoptedApplication = await adopter.post('/api/applications').send({
      animalId: buddy.id, reason: 'An adopted animal must reject any future application.',
      experience: 'Ten years caring for family dogs.', livingArrangement: 'House with a secure fenced yard',
      hasYard: true, hasOtherPets: false, otherPetsDescription: '', employmentStatus: 'Full-time employed',
      references: 'Jordan Smith, (555) 222-3333',
    });
    assert.equal(adoptedApplication.status, 409);

    const medical = await admin.get(`/api/admin/animals/${buddy.id}/medical-records`);
    assert.equal(medical.status, 200);
    assert.ok(medical.body.data.some((record: { notes?: string }) => record.notes === 'Cleared for adoption.'));

    const structuredMedical = await admin.post(`/api/admin/animals/${buddy.id}/medical-records`).send({
      recordType: 'Vaccination', description: 'Annual vaccination visit.', administeredOn: date,
      vetName: 'Dr. Integration', vaccination: 'Rabies booster', healthStatus: 'Healthy',
      treatment: 'Booster administered', notes: 'Next booster due in one year.',
    });
    assert.equal(structuredMedical.status, 201);
    assert.equal(structuredMedical.body.data.vaccination, 'Rabies booster');
    assert.equal(structuredMedical.body.data.healthStatus, 'Healthy');
  });
});

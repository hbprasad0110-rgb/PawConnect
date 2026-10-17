import { Router } from 'express';
import { z } from 'zod';
import { db } from '../db/connection.ts';
import { requireAuth, requireRole } from '../core/auth.ts';
import { ApiError, asyncHandler } from '../core/errors.ts';
import { serialize, serializeMany } from '../core/serializers.ts';
import { validateBody } from '../core/validate.ts';
import { applyTransition } from '../modules/animalStatus/service.ts';

const router = Router();
router.use(requireAuth, requireRole('admin'));

router.get('/summary', asyncHandler(async (_req, res) => {
  const [animals, available, pending, appointments, adoptions] = await Promise.all([
    db('animals').count({ count: '*' }).first(),
    db('animals').where({ status: 'available' }).count({ count: '*' }).first(),
    db('adoption_applications').where({ status: 'pending' }).count({ count: '*' }).first(),
    db('appointments').whereIn('status', ['requested', 'confirmed']).where('starts_at', '>=', db.fn.now()).count({ count: '*' }).first(),
    db('adoptions').count({ count: '*' }).first()
  ]);
  res.json({ data: { totalAnimals: Number(animals?.count || 0), availableAnimals: Number(available?.count || 0), pendingApplications: Number(pending?.count || 0), upcomingAppointments: Number(appointments?.count || 0), completedAdoptions: Number(adoptions?.count || 0) } });
}));

router.post('/applications/:id/complete-adoption', validateBody(z.object({ adoptedOn: z.string().date().optional(), notes: z.string().max(2000).default('') })), asyncHandler(async (req, res) => {
  const adoption = await db.transaction(async (trx) => {
    const application = await trx('adoption_applications').where({ id: req.params.id }).forUpdate().first();
    if (!application) throw new ApiError(404, 'NOT_FOUND', 'Application not found.');
    if (application.status !== 'approved') throw new ApiError(409, 'INVALID_STATE', 'Only approved applications can be completed.');
    const completedAppointment = await trx('appointments').where({ application_id: application.id, status: 'completed' }).first();
    if (!completedAppointment) throw new ApiError(409, 'INVALID_STATE', 'A completed appointment is required before adoption.');
    const existing = await trx('adoptions').where({ animal_id: application.animal_id }).first();
    if (existing) throw new ApiError(409, 'CONFLICT', 'This animal already has an adoption record.');
    const [id] = await trx('adoptions').insert({ application_id: application.id, user_id: application.user_id, animal_id: application.animal_id, adopted_on: req.body.adoptedOn || new Date().toISOString().slice(0, 10), notes: req.body.notes, completed_by: req.user!.id });
    await trx('adoption_applications').where({ id: application.id }).update({ status: 'completed', updated_at: trx.fn.now() });
    await applyTransition(trx, application.animal_id, 'ADOPTION_COMPLETED', req.user!.id);
    return trx('adoptions').where({ id }).first();
  });
  res.status(201).json({ data: serialize(adoption) });
}));

router.get('/adoptions', asyncHandler(async (_req, res) => {
  const rows = await db('adoptions as ad').join('animals as a', 'a.id', 'ad.animal_id').join('users as u', 'u.id', 'ad.user_id').join('users as admin', 'admin.id', 'ad.completed_by').select('ad.*', 'a.name as animal_name', 'a.breed as animal_breed', 'a.photo_url as animal_photo_url', 'u.first_name as adopter_first_name', 'u.last_name as adopter_last_name', 'admin.first_name as admin_first_name', 'admin.last_name as admin_last_name').orderBy('ad.adopted_on', 'desc');
  res.json({ data: serializeMany(rows) });
}));

router.get('/animals/:id/adoption-record', asyncHandler(async (req, res) => {
  const row = await db('adoptions').where({ animal_id: req.params.id }).first();
  if (!row) throw new ApiError(404, 'NOT_FOUND', 'Adoption record not found.');
  res.json({ data: serialize(row) });
}));

router.get('/animals/:id/status-history', asyncHandler(async (req, res) => {
  res.json({ data: serializeMany(await db('animal_status_history').where({ animal_id: req.params.id }).orderBy('created_at', 'desc')) });
}));

export default router;

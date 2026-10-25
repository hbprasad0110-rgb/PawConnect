import { Router } from 'express';
import { z } from 'zod';
import { db } from '../db/connection.ts';
import { appConfig } from '../config/constants.ts';
import { requireAuth, requireRole } from '../core/auth.ts';
import { ApiError, asyncHandler } from '../core/errors.ts';
import { serialize, serializeMany } from '../core/serializers.ts';
import { validateBody } from '../core/validate.ts';
import { nextAppointmentStatus } from '../modules/appointmentStatus/service.ts';

const router = Router();
export const adminAppointmentRouter = Router();
const createSchema = z.object({ applicationId: z.number().int().positive(), startsAt: z.string().datetime(), notes: z.string().max(2000).default('') });
const statusSchema = z.object({ status: z.enum(['confirmed', 'completed', 'cancelled']) });
const appointmentQuery = () => db('appointments as ap').join('animals as a', 'a.id', 'ap.animal_id').join('users as u', 'u.id', 'ap.user_id').select('ap.*', 'a.name as animal_name', 'a.photo_url as animal_photo_url', 'u.first_name as adopter_first_name', 'u.last_name as adopter_last_name');

router.use(requireAuth);

router.get('/availability', asyncHandler(async (req, res) => {
  const date = z.string().date().parse(req.query.date);
  const animalId = z.coerce.number().int().positive().parse(req.query.animalId);
  const day = new Date(`${date}T12:00:00`).getDay();
  const slots = day === appConfig.appointments.closedWeekday
    ? []
    : Array.from(
      { length: appConfig.appointments.closingHour - appConfig.appointments.openingHour },
      (_, index) => `${date}T${String(index + appConfig.appointments.openingHour).padStart(2, '0')}:00:00`,
    );
  const taken = await db('appointments').where({ animal_id: animalId }).whereIn('status', ['requested', 'confirmed']).whereBetween('starts_at', [`${date} 00:00:00`, `${date} 23:59:59`]).pluck('starts_at');
  const takenTimes = new Set(taken.map((value) => new Date(value).getHours()));
  res.json({ data: slots.filter((slot) => !takenTimes.has(new Date(slot).getHours())) });
}));

router.post('/', requireRole('adopter'), validateBody(createSchema), asyncHandler(async (req, res) => {
  const startsAt = new Date(req.body.startsAt);
  const localHour = startsAt.getHours();
  if (
    startsAt <= new Date()
    || startsAt.getDay() === appConfig.appointments.closedWeekday
    || localHour < appConfig.appointments.openingHour
    || localHour >= appConfig.appointments.closingHour
  ) throw new ApiError(400, 'VALIDATION_ERROR', 'Appointments must be in the future, Monday through Saturday, from 10:00 to 17:00.');
  const appointment = await db.transaction(async (trx) => {
    const application = await trx('adoption_applications').where({ id: req.body.applicationId, user_id: req.user!.id }).forUpdate().first();
    if (!application) throw new ApiError(404, 'NOT_FOUND', 'Application not found.');
    if (application.status !== 'approved') throw new ApiError(409, 'INVALID_STATE', 'An approved application is required to schedule an appointment.');
    const existing = await trx('appointments').where({ application_id: application.id }).whereIn('status', ['requested', 'confirmed']).first();
    if (existing) throw new ApiError(409, 'CONFLICT', 'This application already has an active appointment.');
    const [id] = await trx('appointments').insert({ application_id: application.id, user_id: req.user!.id, animal_id: application.animal_id, starts_at: startsAt, status: 'requested', notes: req.body.notes });
    return trx('appointments').where({ id }).first();
  });
  res.status(201).json({ data: serialize(appointment) });
}));

router.get('/mine', requireRole('adopter'), asyncHandler(async (req, res) => {
  res.json({ data: serializeMany(await appointmentQuery().where('ap.user_id', req.user!.id).orderBy('ap.starts_at', 'desc')) });
}));

router.patch('/:id/cancel', requireRole('adopter'), asyncHandler(async (req, res) => {
  const updated = await db('appointments').where({ id: req.params.id, user_id: req.user!.id }).whereIn('status', ['requested', 'confirmed']).update({ status: 'cancelled', updated_at: db.fn.now() });
  if (!updated) throw new ApiError(409, 'INVALID_STATE', 'Only your active appointments can be cancelled.');
  res.json({ data: serialize(await db('appointments').where({ id: req.params.id }).first()) });
}));

adminAppointmentRouter.get('/', requireAuth, requireRole('admin'), asyncHandler(async (req, res) => {
  const query = appointmentQuery();
  if (req.query.status) query.where('ap.status', req.query.status);
  if (req.query.animalId) query.where('ap.animal_id', z.coerce.number().int().positive().parse(req.query.animalId));
  if (req.query.date) {
    const date = z.string().date().parse(req.query.date);
    query.whereBetween('ap.starts_at', [`${date} 00:00:00`, `${date} 23:59:59`]);
  }
  res.json({ data: serializeMany(await query.orderBy('ap.starts_at', 'asc')) });
}));

adminAppointmentRouter.patch('/:id/status', requireAuth, requireRole('admin'), validateBody(statusSchema), asyncHandler(async (req, res) => {
  const appointment = await db.transaction(async (trx) => {
    const current = await trx('appointments').where({ id: req.params.id }).forUpdate().first();
    if (!current) throw new ApiError(404, 'NOT_FOUND', 'Appointment not found.');
    const status = nextAppointmentStatus(current.status, req.body.status);
    await trx('appointments').where({ id: current.id }).update({ status, updated_at: trx.fn.now() });
    return trx('appointments').where({ id: current.id }).first();
  });
  res.json({ data: serialize(appointment) });
}));

export default router;

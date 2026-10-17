import { Router } from 'express';
import { z } from 'zod';
import { db } from '../db/connection.ts';
import { appConfig } from '../config/constants.ts';
import { ApiError, asyncHandler } from '../core/errors.ts';
import { requireAuth, requireRole } from '../core/auth.ts';
import { serialize, serializeMany } from '../core/serializers.ts';
import { validateBody } from '../core/validate.ts';
import { applyTransition } from '../modules/animalStatus/service.ts';

const router = Router();
export const adminAnimalRouter = Router();
export const adminMedicalRouter = Router();
const animalSchema = z.object({
  name: z.string().trim().min(1), type: z.enum(['dog', 'cat']), breed: z.string().trim().min(1),
  ageMonths: z.number().int().nonnegative(), gender: z.enum(['male', 'female']), description: z.string().trim().min(1),
  photoUrl: z.string().url().nullable().optional(), weight: z.string().nullable().optional(), color: z.string().nullable().optional(),
  vaccinated: z.boolean().default(false), neutered: z.boolean().default(false), microchipped: z.boolean().default(false),
  healthSummary: z.string().nullable().optional(), arrivalDate: z.string().date().nullable().optional(), intakeReason: z.string().nullable().optional()
});
const medicalSchema = z.object({ recordType: z.string().trim().min(1), description: z.string().trim().min(1), administeredOn: z.string().date(), vetName: z.string().nullable().optional(), notes: z.string().nullable().optional() });

const animalValues = (body: z.infer<typeof animalSchema>) => ({
  name: body.name, type: body.type, breed: body.breed, age_months: body.ageMonths, gender: body.gender,
  description: body.description, photo_url: body.photoUrl, weight: body.weight, color: body.color,
  vaccinated: body.vaccinated, neutered: body.neutered, microchipped: body.microchipped,
  health_summary: body.healthSummary, arrival_date: body.arrivalDate, intake_reason: body.intakeReason
});

router.get('/', asyncHandler(async (req, res) => {
  const page = Math.max(1, Number(req.query.page || 1));
  const pageSize = Math.min(appConfig.animals.maximumPageSize, Math.max(1, Number(req.query.pageSize || appConfig.animals.defaultPageSize)));
  const query = db('animals');
  if (req.query.search) query.where((builder) => builder.where('name', 'like', `%${req.query.search}%`).orWhere('breed', 'like', `%${req.query.search}%`));
  if (req.query.type) query.where('type', req.query.type);
  if (req.query.gender) query.where('gender', req.query.gender);
  if (req.query.status) query.where('status', req.query.status); else query.whereNot('status', 'adopted');
  const countQuery = query.clone().clearSelect().clearOrder().count({ total: '*' }).first();
  const [rows, count] = await Promise.all([query.clone().orderBy('name').limit(pageSize).offset((page - 1) * pageSize), countQuery]);
  res.json({ data: serializeMany(rows), meta: { page, pageSize, total: Number(count?.total || 0) } });
}));

router.get('/:id', asyncHandler(async (req, res) => {
  const animal = await db('animals').where({ id: req.params.id }).first();
  if (!animal) throw new ApiError(404, 'NOT_FOUND', 'Animal not found.');
  const records = await db('medical_records').where({ animal_id: req.params.id }).orderBy('administered_on', 'desc');
  res.json({ data: { ...serialize(animal), medicalRecords: serializeMany(records) } });
}));

adminAnimalRouter.get('/', requireAuth, requireRole('admin'), asyncHandler(async (_req, res) => {
  res.json({ data: serializeMany(await db('animals').orderBy('name')) });
}));

adminAnimalRouter.get('/:id', requireAuth, requireRole('admin'), asyncHandler(async (req, res) => {
  const animal = await db('animals').where({ id: req.params.id }).first();
  if (!animal) throw new ApiError(404, 'NOT_FOUND', 'Animal not found.');
  res.json({ data: serialize(animal) });
}));

adminAnimalRouter.post('/', requireAuth, requireRole('admin'), validateBody(animalSchema), asyncHandler(async (req, res) => {
  const [id] = await db('animals').insert({ ...animalValues(req.body), status: 'available' });
  res.status(201).json({ data: serialize(await db('animals').where({ id }).first()) });
}));

adminAnimalRouter.put('/:id', requireAuth, requireRole('admin'), validateBody(animalSchema), asyncHandler(async (req, res) => {
  const updated = await db('animals').where({ id: req.params.id }).update({ ...animalValues(req.body), updated_at: db.fn.now() });
  if (!updated) throw new ApiError(404, 'NOT_FOUND', 'Animal not found.');
  res.json({ data: serialize(await db('animals').where({ id: req.params.id }).first()) });
}));

adminAnimalRouter.patch('/:id/status', requireAuth, requireRole('admin'), validateBody(z.object({ status: z.enum(['fostered', 'available']) })), asyncHandler(async (req, res) => {
  const status = await db.transaction((trx) => applyTransition(trx, Number(req.params.id), req.body.status === 'fostered' ? 'MARK_FOSTERED' : 'MARK_AVAILABLE', req.user!.id));
  res.json({ data: { id: Number(req.params.id), status } });
}));

adminAnimalRouter.get('/:id/medical-records', requireAuth, requireRole('admin'), asyncHandler(async (req, res) => {
  res.json({ data: serializeMany(await db('medical_records').where({ animal_id: req.params.id }).orderBy('administered_on', 'desc')) });
}));

adminAnimalRouter.post('/:id/medical-records', requireAuth, requireRole('admin'), validateBody(medicalSchema), asyncHandler(async (req, res) => {
  const animal = await db('animals').where({ id: req.params.id }).first();
  if (!animal) throw new ApiError(404, 'NOT_FOUND', 'Animal not found.');
  const [id] = await db('medical_records').insert({ animal_id: req.params.id, record_type: req.body.recordType, description: req.body.description, administered_on: req.body.administeredOn, vet_name: req.body.vetName, notes: req.body.notes, created_by: req.user!.id });
  res.status(201).json({ data: serialize(await db('medical_records').where({ id }).first()) });
}));

adminMedicalRouter.put('/:id', requireAuth, requireRole('admin'), validateBody(medicalSchema), asyncHandler(async (req, res) => {
  const updated = await db('medical_records').where({ id: req.params.id }).update({ record_type: req.body.recordType, description: req.body.description, administered_on: req.body.administeredOn, vet_name: req.body.vetName, notes: req.body.notes });
  if (!updated) throw new ApiError(404, 'NOT_FOUND', 'Medical record not found.');
  res.json({ data: serialize(await db('medical_records').where({ id: req.params.id }).first()) });
}));

export default router;

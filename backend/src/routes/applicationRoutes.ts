import { Router } from 'express';
import { z } from 'zod';
import { db } from '../db/connection.ts';
import { requireAuth, requireRole } from '../core/auth.ts';
import { ApiError, asyncHandler } from '../core/errors.ts';
import { serialize, serializeMany } from '../core/serializers.ts';
import { validateBody } from '../core/validate.ts';
import { applyTransition } from '../modules/animalStatus/service.ts';
import { sendApplicationStatusEmail, sendApplicationSubmittedEmails } from '../services/emailService.ts';

const router = Router();
export const adminApplicationRouter = Router();
const applicationSchema = z.object({
  animalId: z.number().int().positive(), reason: z.string().trim().min(10), experience: z.string().trim().min(3),
  livingArrangement: z.string().trim().min(3), hasYard: z.boolean(), hasOtherPets: z.boolean(),
  otherPetsDescription: z.string().default(''), employmentStatus: z.string().trim().min(2), references: z.string().trim().min(3)
});
const decisionSchema = z.object({ decision: z.enum(['approved', 'rejected']), decisionNote: z.string().trim().max(2000).default('') });

const detailsQuery = () => db('adoption_applications as aa')
  .join('animals as a', 'a.id', 'aa.animal_id')
  .join('users as u', 'u.id', 'aa.user_id')
  .select('aa.*', 'a.name as animal_name', 'a.breed as animal_breed', 'a.photo_url as animal_photo_url', 'u.first_name as adopter_first_name', 'u.last_name as adopter_last_name', 'u.email as adopter_email', 'u.phone as adopter_phone');

router.use(requireAuth);

router.post('/', requireRole('adopter'), validateBody(applicationSchema), asyncHandler(async (req, res) => {
  const application = await db.transaction(async (trx) => {
    const duplicate = await trx('adoption_applications').where({ user_id: req.user!.id, animal_id: req.body.animalId }).whereIn('status', ['pending', 'approved']).first();
    if (duplicate) throw new ApiError(409, 'CONFLICT', 'You already have an active application for this animal.');
    await applyTransition(trx, req.body.animalId, 'APPLICATION_SUBMITTED', req.user!.id);
    const [id] = await trx('adoption_applications').insert({
      user_id: req.user!.id, animal_id: req.body.animalId, status: 'pending', reason: req.body.reason,
      experience: req.body.experience, living_arrangement: req.body.livingArrangement, has_yard: req.body.hasYard,
      has_other_pets: req.body.hasOtherPets, other_pets_description: req.body.otherPetsDescription,
      employment_status: req.body.employmentStatus, references_text: req.body.references
    });
    return trx('adoption_applications').where({ id }).first();
  });
  const notice = await detailsQuery().where('aa.id', application.id).first();
  await sendApplicationSubmittedEmails({
    email: notice.adopter_email,
    firstName: notice.adopter_first_name,
    animalName: notice.animal_name,
  });
  res.status(201).json({ data: serialize(application) });
}));

router.get('/mine', requireRole('adopter'), asyncHandler(async (req, res) => {
  res.json({ data: serializeMany(await detailsQuery().where('aa.user_id', req.user!.id).orderBy('aa.created_at', 'desc')) });
}));

router.patch('/:id/withdraw', requireRole('adopter'), asyncHandler(async (req, res) => {
  const result = await db.transaction(async (trx) => {
    const application = await trx('adoption_applications')
      .where({ id: req.params.id, user_id: req.user!.id })
      .forUpdate()
      .first();
    if (!application) throw new ApiError(404, 'NOT_FOUND', 'Application not found.');
    if (!['pending', 'approved'].includes(application.status)) {
      throw new ApiError(409, 'INVALID_STATE', 'Only pending or approved applications can be withdrawn.');
    }
    const activeAppointment = await trx('appointments')
      .where({ application_id: application.id })
      .whereIn('status', ['requested', 'confirmed'])
      .first();
    if (activeAppointment) {
      throw new ApiError(409, 'INVALID_STATE', 'Cancel the active appointment before withdrawing this application.');
    }
    await trx('adoption_applications').where({ id: application.id }).update({
      status: 'withdrawn',
      decision_note: 'Withdrawn by adopter.',
      decided_at: trx.fn.now(),
      updated_at: trx.fn.now()
    });
    await applyTransition(trx, application.animal_id, 'APPLICATION_WITHDRAWN', req.user!.id, 'Application withdrawn by adopter.');
    return trx('adoption_applications').where({ id: application.id }).first();
  });
  const notice = await detailsQuery().where('aa.id', result.id).first();
  await sendApplicationStatusEmail({
    email: notice.adopter_email,
    firstName: notice.adopter_first_name,
    animalName: notice.animal_name,
    status: 'withdrawn',
    decisionNote: result.decision_note,
  });
  res.json({ data: serialize(result) });
}));

adminApplicationRouter.get('/', requireAuth, requireRole('admin'), asyncHandler(async (req, res) => {
  const query = detailsQuery();
  if (req.query.status) query.where('aa.status', req.query.status);
  res.json({ data: serializeMany(await query.orderBy('aa.created_at', 'desc')) });
}));

adminApplicationRouter.get('/:id', requireAuth, requireRole('admin'), asyncHandler(async (req, res) => {
  const application = await detailsQuery().where('aa.id', req.params.id).first();
  if (!application) throw new ApiError(404, 'NOT_FOUND', 'Application not found.');
  res.json({ data: serialize(application) });
}));

adminApplicationRouter.patch('/:id/decision', requireAuth, requireRole('admin'), validateBody(decisionSchema), asyncHandler(async (req, res) => {
  const result = await db.transaction(async (trx) => {
    let automaticallyRejectedIds: number[] = [];
    const application = await trx('adoption_applications').where({ id: req.params.id }).forUpdate().first();
    if (!application) throw new ApiError(404, 'NOT_FOUND', 'Application not found.');
    if (application.status !== 'pending') throw new ApiError(409, 'INVALID_STATE', 'Only pending applications can be reviewed.');
    if (req.body.decision === 'approved') {
      const otherApproved = await trx('adoption_applications').where({ animal_id: application.animal_id, status: 'approved' }).whereNot({ id: application.id }).first();
      if (otherApproved) throw new ApiError(409, 'CONFLICT', 'This animal already has an approved application.');
    }
    await trx('adoption_applications').where({ id: application.id }).update({ status: req.body.decision, decision_note: req.body.decisionNote, decided_by: req.user!.id, decided_at: trx.fn.now(), updated_at: trx.fn.now() });
    if (req.body.decision === 'approved') {
      automaticallyRejectedIds = (await trx('adoption_applications')
        .where({ animal_id: application.animal_id, status: 'pending' })
        .whereNot({ id: application.id })
        .pluck('id'))
        .map(Number);
      await trx('adoption_applications').where({ animal_id: application.animal_id, status: 'pending' }).whereNot({ id: application.id }).update({ status: 'rejected', decision_note: 'Another application was approved.', decided_by: req.user!.id, decided_at: trx.fn.now(), updated_at: trx.fn.now() });
      await applyTransition(trx, application.animal_id, 'APPLICATION_APPROVED', req.user!.id, req.body.decisionNote || 'Application approved.');
    } else {
      await applyTransition(trx, application.animal_id, 'APPLICATION_REJECTED', req.user!.id, req.body.decisionNote || 'Application rejected.');
    }
    return {
      application: await trx('adoption_applications').where({ id: application.id }).first(),
      automaticallyRejectedIds,
    };
  });
  const notice = await detailsQuery().where('aa.id', result.application.id).first();
  await sendApplicationStatusEmail({
    email: notice.adopter_email,
    firstName: notice.adopter_first_name,
    animalName: notice.animal_name,
    status: result.application.status,
    decisionNote: result.application.decision_note,
  });
  if (result.automaticallyRejectedIds.length) {
    const automaticallyRejected = await detailsQuery().whereIn('aa.id', result.automaticallyRejectedIds);
    await Promise.all(automaticallyRejected.map((rejected) => sendApplicationStatusEmail({
      email: rejected.adopter_email,
      firstName: rejected.adopter_first_name,
      animalName: rejected.animal_name,
      status: 'rejected',
      decisionNote: rejected.decision_note,
    })));
  }
  res.json({ data: serialize(result.application) });
}));

router.get('/:id', asyncHandler(async (req, res) => {
  const application = await detailsQuery().where('aa.id', req.params.id).first();
  if (!application) throw new ApiError(404, 'NOT_FOUND', 'Application not found.');
  if (req.user!.role !== 'admin' && Number(application.user_id) !== req.user!.id) throw new ApiError(403, 'FORBIDDEN', 'You can only view your own applications.');
  res.json({ data: serialize(application) });
}));

export default router;

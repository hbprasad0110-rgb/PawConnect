import { Router } from 'express';
import { db } from '../db/connection.ts';
import { requireAuth, requireRole } from '../core/auth.ts';
import { asyncHandler } from '../core/errors.ts';
import { serializeMany } from '../core/serializers.ts';

const router = Router();
router.get('/mine', requireAuth, requireRole('adopter'), asyncHandler(async (req, res) => {
  const rows = await db('adoptions as ad')
    .join('animals as a', 'a.id', 'ad.animal_id')
    .join('users as u', 'u.id', 'ad.user_id')
    .select(
      'ad.*',
      'a.name as animal_name',
      'a.type as animal_type',
      'a.breed as animal_breed',
      'a.photo_url as animal_photo_url',
      'u.first_name as adopter_first_name',
      'u.last_name as adopter_last_name',
    )
    .where('ad.user_id', req.user!.id)
    .orderBy('ad.adopted_on', 'desc');
  res.json({ data: serializeMany(rows) });
}));
export default router;

import type { Knex } from 'knex';
import { ApiError } from '../../core/errors.ts';

export type AnimalStatus = 'available' | 'application_pending' | 'approved' | 'fostered' | 'adopted';
export type StatusEvent = 'APPLICATION_SUBMITTED' | 'APPLICATION_APPROVED' | 'APPLICATION_REJECTED' | 'APPLICATION_WITHDRAWN' | 'ADOPTION_COMPLETED' | 'MARK_FOSTERED' | 'MARK_AVAILABLE';

export function nextStatus(current: AnimalStatus, event: StatusEvent, hasOtherPending = false): AnimalStatus {
  if (event === 'APPLICATION_SUBMITTED') {
    if (current === 'adopted') throw new ApiError(409, 'ANIMAL_ALREADY_ADOPTED', 'This animal has already been adopted.');
    if (current === 'approved' || current === 'fostered') throw new ApiError(409, 'ANIMAL_NOT_ACCEPTING_APPLICATIONS', 'This animal is not accepting applications.');
    if (current === 'available' || current === 'application_pending') return 'application_pending';
  }
  if (event === 'APPLICATION_APPROVED' && current === 'application_pending') return 'approved';
  if (event === 'APPLICATION_REJECTED' && current === 'application_pending') return hasOtherPending ? 'application_pending' : 'available';
  if (event === 'APPLICATION_REJECTED' && current === 'approved') return 'approved';
  if (event === 'APPLICATION_WITHDRAWN' && current === 'application_pending') return hasOtherPending ? 'application_pending' : 'available';
  if (event === 'APPLICATION_WITHDRAWN' && current === 'approved') return 'available';
  if (event === 'ADOPTION_COMPLETED' && current === 'approved') return 'adopted';
  if (event === 'MARK_FOSTERED' && current === 'available') return 'fostered';
  if (event === 'MARK_AVAILABLE' && current === 'fostered') return 'available';
  throw new ApiError(409, 'INVALID_STATE', `Cannot apply ${event} while animal status is ${current}.`);
}

export async function applyTransition(trx: Knex.Transaction, animalId: number, event: StatusEvent, actorUserId: number, notes?: string) {
  const animal = await trx('animals').where({ id: animalId }).forUpdate().first();
  if (!animal) throw new ApiError(404, 'NOT_FOUND', 'Animal not found.');
  let hasOtherPending = false;
  if (event === 'APPLICATION_REJECTED' || event === 'APPLICATION_WITHDRAWN') {
    const countRow = await trx('adoption_applications').where({ animal_id: animalId, status: 'pending' }).count({ count: '*' }).first();
    hasOtherPending = Number(countRow?.count || 0) > 0;
  }
  const toStatus = nextStatus(animal.status, event, hasOtherPending);
  if (toStatus !== animal.status) {
    await trx('animals').where({ id: animalId }).update({ status: toStatus, updated_at: trx.fn.now() });
    await trx('animal_status_history').insert({ animal_id: animalId, from_status: animal.status, to_status: toStatus, event, actor_user_id: actorUserId, notes: notes || null });
  }
  return toStatus;
}

import { ApiError } from '../../core/errors.ts';

export type AppointmentStatus = 'requested' | 'confirmed' | 'completed' | 'cancelled';

export function nextAppointmentStatus(current: AppointmentStatus, requested: Exclude<AppointmentStatus, 'requested'>): AppointmentStatus {
  if (current === 'requested' && ['confirmed', 'cancelled'].includes(requested)) return requested;
  if (current === 'confirmed' && ['completed', 'cancelled'].includes(requested)) return requested;
  throw new ApiError(409, 'INVALID_STATE', `Cannot change appointment from ${current} to ${requested}.`);
}

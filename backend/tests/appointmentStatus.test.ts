import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { ApiError } from '../src/core/errors.ts';
import { nextAppointmentStatus } from '../src/modules/appointmentStatus/service.ts';

describe('appointment status state machine', () => {
  it('confirms, completes, and cancels active appointments', () => {
    assert.equal(nextAppointmentStatus('requested', 'confirmed'), 'confirmed');
    assert.equal(nextAppointmentStatus('requested', 'cancelled'), 'cancelled');
    assert.equal(nextAppointmentStatus('confirmed', 'completed'), 'completed');
    assert.equal(nextAppointmentStatus('confirmed', 'cancelled'), 'cancelled');
  });

  it('does not reopen terminal appointments or reconfirm confirmed appointments', () => {
    assert.throws(() => nextAppointmentStatus('completed', 'confirmed'), ApiError);
    assert.throws(() => nextAppointmentStatus('cancelled', 'confirmed'), ApiError);
    assert.throws(() => nextAppointmentStatus('confirmed', 'confirmed'), ApiError);
    assert.throws(() => nextAppointmentStatus('requested', 'completed'), ApiError);
  });
});

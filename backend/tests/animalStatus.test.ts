import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { ApiError } from '../src/core/errors.ts';
import { nextStatus } from '../src/modules/animalStatus/service.ts';

describe('animal status state machine', () => {
  it('supports the adoption happy path', () => {
    assert.equal(nextStatus('available', 'APPLICATION_SUBMITTED'), 'application_pending');
    assert.equal(nextStatus('application_pending', 'APPLICATION_APPROVED'), 'approved');
    assert.equal(nextStatus('approved', 'ADOPTION_COMPLETED'), 'adopted');
  });

  it('returns an animal to available after the last rejection', () => {
    assert.equal(nextStatus('application_pending', 'APPLICATION_REJECTED', false), 'available');
    assert.equal(nextStatus('application_pending', 'APPLICATION_REJECTED', true), 'application_pending');
  });

  it('returns an animal to the appropriate state when an application is withdrawn', () => {
    assert.equal(nextStatus('application_pending', 'APPLICATION_WITHDRAWN', false), 'available');
    assert.equal(nextStatus('application_pending', 'APPLICATION_WITHDRAWN', true), 'application_pending');
    assert.equal(nextStatus('approved', 'APPLICATION_WITHDRAWN'), 'available');
  });

  it('rejects invalid transitions', () => {
    assert.throws(() => nextStatus('adopted', 'MARK_AVAILABLE'), ApiError);
  });
});

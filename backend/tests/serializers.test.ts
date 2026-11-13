import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { serialize, serializeMany } from '../src/core/serializers.ts';

describe('database row serializers', () => {
  it('converts snake case and special field names to API names', () => {
    assert.deepEqual(serialize({
      first_name: 'Sam',
      age_months: 18,
      references_text: 'Jordan Smith',
      starts_at: '2026-10-30T15:00:00.000Z',
      unknown_field: 'preserved',
    }), {
      firstName: 'Sam',
      ageMonths: 18,
      references: 'Jordan Smith',
      startsAt: '2026-10-30T15:00:00.000Z',
      unknownField: 'preserved',
    });
  });

  it('never includes internal credential or guard columns', () => {
    assert.deepEqual(serialize({
      id: 4,
      password_hash: 'secret-hash',
      is_active: true,
      admin_guard: 1,
    }), { id: 4 });
  });

  it('serializes every row and preserves nullish input', () => {
    assert.deepEqual(serializeMany([{ animal_id: 3 }, { animal_id: 7 }]), [
      { animalId: 3 },
      { animalId: 7 },
    ]);
    assert.equal(serialize(null), null);
    assert.equal(serialize(undefined), undefined);
  });
});

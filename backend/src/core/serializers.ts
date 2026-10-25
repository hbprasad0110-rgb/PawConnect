const keyMap: Record<string, string> = {
  first_name: 'firstName', last_name: 'lastName',
  photo_url: 'photoUrl', age_months: 'ageMonths', health_summary: 'healthSummary',
  arrival_date: 'arrivalDate', intake_reason: 'intakeReason', animal_id: 'animalId',
  user_id: 'userId', application_id: 'applicationId', record_type: 'recordType',
  administered_on: 'administeredOn', vet_name: 'vetName', created_by: 'createdBy',
  living_arrangement: 'livingArrangement', has_yard: 'hasYard', has_other_pets: 'hasOtherPets',
  other_pets_description: 'otherPetsDescription', employment_status: 'employmentStatus',
  references_text: 'references', decision_note: 'decisionNote', decided_by: 'decidedBy',
  decided_at: 'decidedAt', starts_at: 'startsAt', adopted_on: 'adoptedOn',
  completed_by: 'completedBy', from_status: 'fromStatus', to_status: 'toStatus',
  actor_user_id: 'actorUserId', created_at: 'createdAt', updated_at: 'updatedAt'
};

export const serialize = <T extends Record<string, unknown>>(row: T | undefined | null) => {
  if (!row) return row;
  const camelCase = (key: string) => key.replace(/_([a-z])/g, (_match, letter: string) => letter.toUpperCase());
  return Object.fromEntries(
    Object.entries(row)
      .filter(([key]) => !['password_hash', 'is_active', 'admin_guard'].includes(key))
      .map(([key, value]) => [keyMap[key] || camelCase(key), value])
  );
};

export const serializeMany = (rows: Record<string, unknown>[]) => rows.map((row) => serialize(row));

import { afterEach, describe, expect, it, vi } from 'vitest';
import { ageToMonths, api, mapAnimal, mapAppointment, mapMedicalRecord } from './api';

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('frontend API mappings', () => {
  it('converts readable animal ages to database months', () => {
    expect(ageToMonths('2 years')).toBe(24);
    expect(ageToMonths('1y 6m')).toBe(18);
    expect(ageToMonths('7 months')).toBe(7);
  });

  it('maps animal, appointment, and structured medical fields', () => {
    expect(mapAnimal({ id: 3, type: 'cat', gender: 'female', ageMonths: 18, status: 'available' })).toMatchObject({
      id: '3', type: 'CAT', gender: 'Female', age: '1y 6m', status: 'AVAILABLE',
    });
    expect(mapAppointment({ id: 7, applicationId: 2, startsAt: '2026-10-30T15:00:00.000Z', status: 'requested', purpose: 'Family introduction' })).toMatchObject({
      id: '7', applicationId: '2', status: 'REQUESTED', purpose: 'Family introduction',
    });
    expect(mapMedicalRecord({ id: 5, vaccination: 'Rabies', healthStatus: 'Healthy', treatment: 'Booster' })).toMatchObject({
      id: '5', vaccination: 'Rabies', healthStatus: 'Healthy', treatment: 'Booster',
    });
  });

  it('raises the session-expired event on an authenticated request failure', async () => {
    const dispatchEvent = vi.fn();
    vi.stubGlobal('window', { dispatchEvent });
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ error: { code: 'UNAUTHENTICATED', message: 'Expired.' } }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })));

    await expect(api.profile()).rejects.toMatchObject({ status: 401, code: 'UNAUTHENTICATED' });
    expect(dispatchEvent).toHaveBeenCalledOnce();
  });

  it('does not raise the session-expired event for the anonymous startup session check', async () => {
    const dispatchEvent = vi.fn();
    vi.stubGlobal('window', { dispatchEvent });
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ error: { code: 'UNAUTHENTICATED', message: 'No session.' } }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })));

    await expect(api.session()).rejects.toMatchObject({ status: 401, code: 'UNAUTHENTICATED' });
    expect(dispatchEvent).not.toHaveBeenCalled();
  });
});

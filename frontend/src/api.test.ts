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

describe('API request regressions', () => {
  it('includes cookie credentials and JSON headers on login without expiring another session', async () => {
    const dispatchEvent = vi.fn();
    vi.stubGlobal('window', { dispatchEvent });
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ error: { message: 'Invalid credentials' } }), { status: 401 }));
    vi.stubGlobal('fetch', fetchMock);
    await expect(api.login('test@example.test', 'wrong')).rejects.toMatchObject({ status: 401 });
    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining('/auth/login'), expect.objectContaining({
      credentials: 'include', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@example.test', password: 'wrong' }),
    }));
    expect(dispatchEvent).not.toHaveBeenCalled();
  });
  it('handles non-JSON server errors with the standard fallback', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('Service unavailable', { status: 503 })));
    await expect(api.health()).rejects.toMatchObject({ status: 503, code: 'REQUEST_FAILED', message: 'The request could not be completed.' });
  });
  it('encodes search strings and preserves false and zero filter values', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ data: [], meta: { page: 1, pageSize: 9, total: 0 } })));
    vi.stubGlobal('fetch', fetchMock);
    await api.searchAnimals({ search: 'a&status=adopted', includeAdopted: false, minAgeMonths: 0 });
    const url = new URL(fetchMock.mock.calls[0][0], 'http://localhost');
    expect(url.searchParams.get('search')).toBe('a&status=adopted');
    expect(url.searchParams.get('status')).toBeNull();
    expect(url.searchParams.get('includeAdopted')).toBe('false');
    expect(url.searchParams.get('minAgeMonths')).toBe('0');
  });
  it('maps missing optional fields and invalid appointment dates safely', () => {
    expect(mapAnimal({})).toMatchObject({ id: '', name: '', medicalRecords: [], age: '0 months' });
    expect(mapAppointment({ startsAt: 'invalid' })).toMatchObject({ date: '', time: '' });
  });
});

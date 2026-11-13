import { describe, expect, it } from 'vitest';
import { landingPath, pageFromPath, PAGE_PATHS, paramsFromPath, pathFor, pathFromLegacyHash } from './routes';

describe('frontend route helpers', () => {
  it('resolves registered routes and extracts their parameters', () => {
    expect(pageFromPath('/animals/42')).toBe('animal-profile');
    expect(paramsFromPath('/animals/42/apply')).toEqual({ animalId: '42' });
    expect(paramsFromPath('/my/applications/7/schedule')).toEqual({ applicationId: '7' });
    expect(pageFromPath('/not-a-route')).toBeNull();
    expect(paramsFromPath('/not-a-route')).toEqual({});
  });

  it('generates paths and redirects to list pages when a required id is missing', () => {
    expect(pathFor('animal-profile', { animalId: '42' })).toBe('/animals/42');
    expect(pathFor('animal-profile')).toBe(PAGE_PATHS.animals);
    expect(pathFor('schedule-appointment')).toBe(PAGE_PATHS['my-applications']);
    expect(pathFor('admin-complete-adoption')).toBe(PAGE_PATHS['admin-appointments']);
  });

  it('selects role-specific landing pages', () => {
    expect(landingPath({ role: 'ADMIN' })).toBe('/admin');
    expect(landingPath({ role: 'ADOPTER' })).toBe('/');
  });

  it('converts supported legacy hash routes and retains reset tokens', () => {
    expect(pathFromLegacyHash('#/animals')).toBe('/animals');
    expect(pathFromLegacyHash('#/animal-profile?animal=42')).toBe('/animals/42');
    expect(pathFromLegacyHash('#/reset-password?token=a+b')).toBe('/reset-password?token=a%20b');
    expect(pathFromLegacyHash('#/unknown')).toBeNull();
    expect(pathFromLegacyHash('#/')).toBeNull();
  });
});

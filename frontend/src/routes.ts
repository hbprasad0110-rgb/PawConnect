import { generatePath, matchPath } from 'react-router-dom';
import type { Page, User } from './types';

export interface RouteIds {
  animalId?: string;
  applicationId?: string;
  appointmentId?: string;
}

// One URL pattern per screen. The Page keys are what the screens pass to navigate().
export const PAGE_PATHS: Record<Page, string> = {
  home: '/',
  animals: '/animals',
  'animal-profile': '/animals/:animalId',
  login: '/login',
  register: '/register',
  'forgot-password': '/forgot-password',
  'reset-password': '/reset-password',
  apply: '/animals/:animalId/apply',
  'my-applications': '/my/applications',
  'schedule-appointment': '/my/applications/:applicationId/schedule',
  'my-appointments': '/my/appointments',
  'my-adoption-history': '/my/adoption-history',
  profile: '/profile',
  'admin-dashboard': '/admin',
  'admin-animals': '/admin/animals',
  'admin-animal-edit': '/admin/animals/:animalId/edit',
  'admin-medical-records': '/admin/medical-records',
  'admin-applications': '/admin/applications',
  'admin-appointments': '/admin/appointments',
  'admin-complete-adoption': '/admin/appointments/:appointmentId/complete-adoption',
  'admin-adoption-history': '/admin/adoptions',
};

const pages = Object.keys(PAGE_PATHS) as Page[];

const matchPage = (pathname: string) => {
  for (const page of pages) {
    const match = matchPath({ path: PAGE_PATHS[page], end: true }, pathname);
    if (match) return { page, params: match.params as RouteIds };
  }
  return null;
};

export const pageFromPath = (pathname: string): Page | null => matchPage(pathname)?.page ?? null;

export const paramsFromPath = (pathname: string): RouteIds => matchPage(pathname)?.params ?? {};

// Screens that need an id fall back to their list screen when it is missing.
const requiredId: Partial<Record<Page, { key: keyof RouteIds; fallback: string }>> = {
  'animal-profile': { key: 'animalId', fallback: PAGE_PATHS.animals },
  apply: { key: 'animalId', fallback: PAGE_PATHS.animals },
  'schedule-appointment': { key: 'applicationId', fallback: PAGE_PATHS['my-applications'] },
  'admin-animal-edit': { key: 'animalId', fallback: PAGE_PATHS['admin-animals'] },
  'admin-complete-adoption': { key: 'appointmentId', fallback: PAGE_PATHS['admin-appointments'] },
};

export const pathFor = (page: Page, ids: RouteIds = {}): string => {
  const needed = requiredId[page];
  if (needed && !ids[needed.key]) return needed.fallback;
  return generatePath(PAGE_PATHS[page], ids as Record<string, string>);
};

export const landingPath = (user: Pick<User, 'role'>) => (user.role === 'ADMIN' ? PAGE_PATHS['admin-dashboard'] : PAGE_PATHS.home);

export const pathFromLegacyHash = (hash: string): string | null => {
  const raw = hash.replace(/^#\/?/, '');
  if (!raw) return null;
  const [pageName, query = ''] = raw.split('?');
  if (!(pageName in PAGE_PATHS)) return null;

  const page = pageName as Page;
  const params = new URLSearchParams(query);
  const path = pathFor(page, {
    animalId: params.get('animal') || undefined,
    applicationId: params.get('application') || undefined,
    appointmentId: params.get('appointment') || undefined,
  });
  const token = params.get('token');
  return token ? `${path}?token=${encodeURIComponent(token)}` : path;
};

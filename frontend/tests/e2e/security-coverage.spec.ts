import { expect, test, type Page, type Route } from '@playwright/test';

const adopter = { id: 7, firstName: 'Browser', lastName: 'Tester', email: 'browser@pawconnect.test', role: 'adopter', phone: '5551234567', address: '123 Main Street' };
const admin = { id: 9, firstName: 'Shelter', lastName: 'Admin', email: 'admin@pawconnect.test', role: 'admin', phone: '5551234567', address: '123 Main Street' };
const animal = { id: 1, name: 'Daisy', type: 'dog', breed: 'Beagle', ageMonths: 60, gender: 'female', status: 'available', description: 'Friendly shelter companion', photoUrl: '', medicalRecords: [] };

type SecurityFixture = { role?: 'adopter' | 'admin'; sessionExpired?: boolean; duplicateRegistration?: boolean };

async function installSecurityApi(page: Page, options: SecurityFixture = {}) {
  let role = options.role;
  const json = (route: Route, data: unknown, status = 200) => route.fulfill({ status, contentType: 'application/json', body: JSON.stringify({ data }) });
  const error = (route: Route, message: string, status: number) => route.fulfill({ status, contentType: 'application/json', body: JSON.stringify({ error: { code: status === 401 ? 'UNAUTHENTICATED' : 'CONFLICT', message } }) });

  await page.route('**/api/**', async route => {
    const request = route.request();
    const path = new URL(request.url()).pathname;
    const method = request.method();
    if (path === '/api/health') return json(route, { status: 'ok' });
    if (path === '/api/animals/stats/summary') return json(route, { availableAnimals: 1, totalAnimals: 1, adoptedAnimals: 0 });
    if (path === '/api/auth/me') return role ? json(route, role === 'admin' ? admin : adopter) : error(route, 'The session is invalid or expired.', 401);
    if (path === '/api/auth/login' && method === 'POST') {
      const body = request.postDataJSON() as { email: string };
      role = body.email.includes('admin') ? 'admin' : 'adopter';
      return json(route, role === 'admin' ? admin : adopter);
    }
    if (path === '/api/auth/logout') { role = undefined; return json(route, { loggedOut: true }); }
    if (path === '/api/auth/profile' && method === 'GET' && options.sessionExpired) return error(route, 'The session is invalid or expired.', 401);
    if (path === '/api/auth/profile') return json(route, adopter);
    if (path === '/api/auth/register' && method === 'POST' && options.duplicateRegistration) return error(route, 'An account with this email already exists.', 409);
    if (path === '/api/auth/register') { role = 'adopter'; return json(route, adopter, 201); }
    if (path === '/api/animals') return route.fulfill({ contentType: 'application/json', body: JSON.stringify({ data: [animal], meta: { page: 1, pageSize: 9, total: 1 } }) });
    if (path === '/api/animals/1') return json(route, animal);
    if (path === '/api/applications/mine' || path === '/api/appointments/mine' || path === '/api/adoptions/mine') return json(route, []);
    if (path.startsWith('/api/admin/')) return role === 'admin' ? json(route, path.endsWith('/summary') ? { totalAnimals: 1, availableAnimals: 1, pendingApplications: 0, upcomingAppointments: 0, completedAdoptions: 0 } : []) : error(route, 'admin access is required.', 403);
    if (path === '/api/auth/reset-password' && method === 'POST') return error(route, 'This password reset link is invalid or has expired.', 400);
    if (path === '/api/auth/forgot-password') return json(route, { message: 'If an account exists for that email, a password reset link has been sent.' });
    return json(route, {});
  });
}

async function signIn(page: Page, role: 'adopter' | 'admin' = 'adopter') {
  await page.goto('/login');
  await page.locator('input[type="email"]').fill(role === 'admin' ? 'admin@pawconnect.test' : adopter.email);
  await page.locator('input[type="password"]').fill('Password123!');
  await page.getByRole('button', { name: 'Sign In' }).click();
}

test('anonymous and invalid-token browser sessions cannot access protected routes', async ({ page }) => {
  await installSecurityApi(page);
  await page.goto('/admin');
  await expect(page).toHaveURL(/\/login$/);

  await page.context().addCookies([{ name: 'pc_token', value: 'forged.invalid.token', domain: '127.0.0.1', path: '/' }]);
  await page.goto('/profile');
  await expect(page).toHaveURL(/\/login$/);
});

test('browser role guards prevent adopter/admin cross-access', async ({ page }) => {
  await installSecurityApi(page);
  await signIn(page, 'adopter');
  await page.goto('/admin');
  await expect(page).toHaveURL(/\/$/);

  const adminPage = await page.context().newPage();
  await installSecurityApi(adminPage, { role: 'admin' });
  await adminPage.goto('/my/applications');
  await expect(adminPage).toHaveURL(/\/admin$/);
});

test('logout and an expired authenticated request clear browser access', async ({ page }) => {
  await installSecurityApi(page);
  await signIn(page);
  await page.getByRole('button', { name: 'Sign Out' }).click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole('link', { name: 'Profile' })).toHaveCount(0);

  const expiredPage = await page.context().newPage();
  await installSecurityApi(expiredPage, { role: 'adopter', sessionExpired: true });
  await expiredPage.goto('/profile');
  await expect(expiredPage).toHaveURL(/\/login$/);
});

test('registration and password-reset forms reject unsafe requests', async ({ page }) => {
  await installSecurityApi(page, { duplicateRegistration: true });
  await page.goto('/register');
  await page.getByRole('button', { name: 'Create Account' }).click();
  await expect(page.getByText('Full name is required.')).toBeVisible();
  await page.getByLabel('Full Name').fill('Duplicate User');
  await page.getByLabel('Email Address').fill('duplicate@pawconnect.test');
  await page.getByLabel('Password', { exact: true }).fill('Password123!');
  await page.getByLabel('Confirm Password').fill('Password123!');
  await page.getByLabel('Phone Number').fill('5551234567');
  await page.getByLabel('Home Address').fill('123 Main Street');
  await page.getByRole('button', { name: 'Create Account' }).click();
  await expect(page.getByText('An account with this email already exists.')).toBeVisible();

  await page.goto('/reset-password?token=invalid-password-reset-token-value-1234567890');
  await page.getByLabel('New Password').fill('Password123!');
  await page.getByLabel('Confirm Password').fill('Password123!');
  await page.getByRole('button', { name: 'Reset password' }).click();
  await expect(page.getByText('This password reset link is invalid or has expired.')).toBeVisible();
});

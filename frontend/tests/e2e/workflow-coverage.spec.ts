import { expect, test, type Page, type Route } from '@playwright/test';

const animal = {
  id: 1, name: 'Daisy', type: 'dog', breed: 'Beagle', ageMonths: 60, gender: 'female',
  status: 'available', description: 'Friendly shelter companion', photoUrl: '',
  medicalRecords: [], vaccinated: true, neutered: true, microchipped: true,
};

const adopter = {
  id: 7, firstName: 'Browser', lastName: 'Tester', email: 'browser@pawconnect.test',
  role: 'adopter', phone: '5551234567', address: '123 Main Street',
};

const admin = { ...adopter, id: 9, firstName: 'Shelter', lastName: 'Admin', email: 'admin@pawconnect.test', role: 'admin' };

const application = {
  id: 42, animalId: 1, userId: 7, adopterFirstName: 'Browser', adopterLastName: 'Tester',
  adopterEmail: adopter.email, status: 'pending', createdAt: '2026-11-01T12:00:00Z',
  reason: 'I can provide a loving home.', experience: 'I have cared for dogs for years.',
  livingArrangement: 'A house with a fenced yard.', hasYard: true, hasOtherPets: false,
  otherPetsDescription: '', employmentStatus: 'Employed', references: 'Dr. Vet, 5551234567',
};

const appointment = {
  id: 12, applicationId: 42, animalId: 1, userId: 7, animalName: 'Daisy',
  adopterFirstName: 'Browser', adopterLastName: 'Tester', startsAt: '2026-11-10T21:00:00.000Z',
  status: 'requested', purpose: 'Meet and greet', notes: '',
};

type FixtureOptions = { role?: 'adopter' | 'admin'; sessionExpiredOnProfile?: boolean; conflictOnAppointment?: boolean };

async function installApi(page: Page, options: FixtureOptions = {}) {
  let role = options.role;
  let currentApplication = { ...application };
  let updatedProfile = false;
  let registered = false;

  const json = (route: Route, data: unknown, status = 200) => route.fulfill({ status, contentType: 'application/json', body: JSON.stringify({ data }) });
  const errorJson = (route: Route, message: string, status: number) => route.fulfill({ status, contentType: 'application/json', body: JSON.stringify({ error: { message } }) });
  await page.route('**/api/**', async route => {
    const request = route.request();
    const url = new URL(request.url());
    const path = url.pathname;
    const method = request.method();

    if (path === '/api/health') return json(route, { status: 'ok', service: 'test' });
    if (path === '/api/animals/stats/summary') return json(route, { availableAnimals: 1, totalAnimals: 1, adoptedAnimals: 0 });
    if (path === '/api/auth/me') {
      if (!role && !registered) return errorJson(route, 'No session.', 401);
      return json(route, role === 'admin' ? admin : adopter);
    }
    if (path === '/api/auth/login' && method === 'POST') {
      const body = request.postDataJSON() as { email: string; password: string };
      if (body.email === 'bad@pawconnect.test' || body.password === 'wrong') return errorJson(route, 'Invalid email or password.', 401);
      role = body.email.includes('admin') ? 'admin' : 'adopter';
      return json(route, role === 'admin' ? admin : adopter);
    }
    if (path === '/api/auth/register' && method === 'POST') {
      registered = true;
      role = 'adopter';
      return json(route, adopter);
    }
    if (path === '/api/auth/logout') { role = undefined; registered = false; return json(route, {}); }
    if (path === '/api/auth/profile' && method === 'GET') {
      if (options.sessionExpiredOnProfile) return errorJson(route, 'Session expired.', 401);
      return json(route, updatedProfile ? { ...adopter, firstName: 'Updated', lastName: 'Name', phone: '5557654321', address: '456 Updated Avenue' } : adopter);
    }
    if (path === '/api/auth/profile' && method === 'PUT') { updatedProfile = true; return json(route, { ...adopter, firstName: 'Updated', lastName: 'Name', phone: '5557654321', address: '456 Updated Avenue' }); }
    if (path === '/api/animals') return route.fulfill({ contentType: 'application/json', body: JSON.stringify({ data: [animal], meta: { page: 1, pageSize: 9, total: 1 } }) });
    if (path === '/api/admin/animals') return json(route, [animal]);
    if (path === '/api/animals/1' || path === '/api/admin/animals/1') return json(route, animal);
    if (path === '/api/applications/mine') return json(route, role === 'adopter' ? [currentApplication] : []);
    if (path === '/api/admin/applications' && method === 'GET') return json(route, [currentApplication]);
    if (path === '/api/applications/42' || path === '/api/admin/applications/42') return json(route, currentApplication);
    if (path === '/api/applications' && method === 'POST') { currentApplication = { ...currentApplication, status: 'pending' }; return json(route, currentApplication, 201); }
    if (path === '/api/admin/applications/42/decision' && method === 'PATCH') {
      const body = request.postDataJSON() as { decision: string };
      currentApplication = { ...currentApplication, status: body.decision };
      return json(route, currentApplication);
    }
    if (path === '/api/appointments/mine') return json(route, role === 'adopter' ? [appointment] : []);
    if (path === '/api/admin/appointments') return json(route, []);
    if (path === '/api/appointments/availability') return json(route, ['2026-11-10T21:00:00.000Z']);
    if (path === '/api/appointments' && method === 'POST') {
      if (options.conflictOnAppointment) return errorJson(route, 'You already have another appointment at this time.', 409);
      return json(route, appointment, 201);
    }
    if (path === '/api/adoptions/mine' || path === '/api/admin/adoptions') return json(route, []);
    if (path === '/api/admin/summary') return json(route, { totalAnimals: 1, availableAnimals: 1, pendingApplications: 1, upcomingAppointments: 0, completedAdoptions: 0 });
    return json(route, {});
  });
}

async function login(page: Page, role: 'adopter' | 'admin' = 'adopter') {
  await page.goto('/login');
  await page.getByRole('button', { name: role === 'admin' ? 'Admin Login' : 'Adopter Login' }).click();
}

test('registration succeeds and redirects to animal browsing', async ({ page }) => {
  await installApi(page);
  await page.goto('/register');
  await page.getByLabel('Full Name').fill('Browser Tester');
  await page.getByLabel('Email Address').fill('new-user@pawconnect.test');
  await page.getByLabel('Password', { exact: true }).fill('Password123!');
  await page.getByLabel('Confirm Password').fill('Password123!');
  await page.getByLabel('Phone Number').fill('5551234567');
  await page.getByLabel('Home Address').fill('123 Main Street');
  await page.getByRole('button', { name: 'Create Account' }).click();
  await expect(page.getByText('Account Created!')).toBeVisible();
  await expect(page).toHaveURL(/\/animals$/, { timeout: 5_000 });
});

test('valid login works and invalid credentials show an error', async ({ page }) => {
  await installApi(page);
  await page.goto('/login');
  await page.locator('input[type="email"]').fill('bad@pawconnect.test');
  await page.locator('input[type="password"]').fill('wrong');
  await page.getByRole('button', { name: 'Sign In' }).click();
  await expect(page.getByText('Invalid email or password.')).toBeVisible();
  await page.locator('input[type="email"]').fill(adopter.email);
  await page.locator('input[type="password"]').fill('Password123!');
  await page.getByRole('button', { name: 'Sign In' }).click();
  await expect(page).toHaveURL(/\/$/);
});

test('logout clears the session and expired sessions return to login', async ({ page }) => {
  await installApi(page);
  await login(page);
  await page.getByRole('button', { name: 'Sign Out' }).click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole('link', { name: 'Profile' })).toHaveCount(0);

  const expiredPage = await page.context().newPage();
  await installApi(expiredPage, { sessionExpiredOnProfile: true });
  await login(expiredPage);
  await expiredPage.goto('/profile');
  await expect(expiredPage).toHaveURL(/\/login$/);
});

test('animals can be filtered and their details can be opened', async ({ page }) => {
  await installApi(page);
  await page.goto('/animals');
  await page.getByPlaceholder('Search by name or breed...').fill('Daisy');
  await expect(page.getByRole('heading', { name: 'Daisy' })).toBeVisible();
  await page.getByRole('button', { name: /Daisy/ }).first().click();
  await expect(page).toHaveURL(/\/animals\/1$/);
  await expect(page.getByText('Friendly shelter companion')).toBeVisible();
});

test('application validation, submission, status, and appointment booking are covered', async ({ page }) => {
  await installApi(page);
  await login(page);
  await page.goto('/animals/1/apply');
  await page.getByRole('button', { name: 'Submit Application' }).click();
  await expect(page.getByText('Please explain why you want to adopt.')).toBeVisible();
  await page.getByPlaceholder("Tell us why you'd like to adopt and what kind of home you'll provide...").fill('I can provide a loving home.');
  await page.getByPlaceholder('Have you owned pets before? What types? Any training experience?').fill('I have cared for dogs for years.');
  await page.locator('select').nth(0).selectOption({ label: 'House with large fenced yard' });
  await page.locator('select').nth(1).selectOption({ label: 'Full-time employed' });
  await page.getByPlaceholder(/Name, relationship, phone number/).fill('Dr. Vet, 5551234567');
  await page.getByRole('button', { name: 'Submit Application' }).click();
  await expect(page.getByText('Application Submitted!')).toBeVisible();
  await page.getByRole('button', { name: 'View My Applications' }).click();
  await expect(page.getByRole('heading', { name: 'My Applications' })).toBeVisible();
  await expect(page.getByText('Pending')).toBeVisible();
});

test('admin can approve applications', async ({ page }) => {
  await installApi(page);
  await login(page, 'admin');
  await page.goto('/admin/applications');
  await page.getByRole('button', { name: /Browser Tester.*Daisy/ }).click();
  const approve = page.getByRole('button', { name: 'Approve Application' });
  await approve.click({ force: true });
  await page.getByRole('button', { name: 'Yes, Approve' }).dispatchEvent('click');
  await expect(page.getByText('Approved')).toBeVisible();
});

test('admin can reject applications', async ({ page }) => {
  await installApi(page);
  await login(page, 'admin');
  await page.goto('/admin/applications');
  await page.getByRole('button', { name: /Browser Tester.*Daisy/ }).click();
  const reject = page.getByRole('button', { name: 'Reject Application' });
  await reject.click({ force: true });
  await page.getByRole('button', { name: 'Yes, Reject' }).dispatchEvent('click');
  await expect(page.getByText('Rejected')).toBeVisible();
});

test('appointment booking succeeds and conflicts show a useful error', async ({ page }) => {
  await installApi(page);
  await login(page);
  await page.goto('/my/applications/42/schedule');
  await page.locator('input[type="date"]').fill('2026-11-10');
  await page.getByRole('button', { name: '3:00 PM' }).click();
  await page.getByRole('button', { name: 'Request Appointment' }).click();
  await expect(page.getByText('Appointment Requested!')).toBeVisible();

  const conflictPage = await page.context().newPage();
  await installApi(conflictPage, { conflictOnAppointment: true });
  await login(conflictPage);
  await conflictPage.goto('/my/applications/42/schedule');
  await conflictPage.locator('input[type="date"]').fill('2026-11-10');
  await conflictPage.getByRole('button', { name: '3:00 PM' }).click();
  await conflictPage.getByRole('button', { name: 'Request Appointment' }).click();
  await expect(conflictPage.getByText('You already have another appointment at this time.')).toBeVisible();
});

test('profile updates persist and protected routes redirect anonymous users', async ({ page }) => {
  await installApi(page);
  await page.goto('/my/applications');
  await expect(page).toHaveURL(/\/login$/);
  await login(page);
  await page.goto('/profile');
  await page.getByLabel('First Name').fill('Updated');
  await page.getByLabel('Last Name').fill('Name');
  await page.getByLabel('Phone').fill('5557654321');
  await page.getByLabel('Address').fill('456 Updated Avenue');
  await page.getByRole('button', { name: 'Save Profile' }).click();
  await expect(page.getByText('Profile updated.')).toBeVisible();
});

test('navigation links move between public and authenticated pages', async ({ page }) => {
  await installApi(page);
  await page.goto('/');
  await page.getByRole('link', { name: 'Browse Animals' }).first().click();
  await expect(page).toHaveURL(/\/animals$/);
  await page.getByRole('button', { name: /Daisy/ }).first().click();
  await expect(page).toHaveURL(/\/animals\/1$/);
  await page.getByRole('button', { name: 'Apply for Adoption' }).click();
  await expect(page).toHaveURL(/\/login$/);
});

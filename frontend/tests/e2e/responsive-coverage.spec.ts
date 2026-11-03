import { expect, test, type Page, type Route } from '@playwright/test';

const animal = {
  id: 1, name: 'Daisy', type: 'dog', breed: 'Beagle', ageMonths: 60, gender: 'female',
  status: 'available', description: 'Friendly shelter companion', photoUrl: '', medicalRecords: [],
};

async function installPublicApi(page: Page) {
  await page.route('**/api/**', async (route: Route) => {
    const path = new URL(route.request().url()).pathname;
    if (path === '/api/auth/me') return route.fulfill({ status: 401, contentType: 'application/json', body: JSON.stringify({ error: { code: 'UNAUTHENTICATED', message: 'No session.' } }) });
    if (path === '/api/health') return route.fulfill({ contentType: 'application/json', body: JSON.stringify({ data: { status: 'ok' } }) });
    if (path === '/api/animals/stats/summary') return route.fulfill({ contentType: 'application/json', body: JSON.stringify({ data: { availableAnimals: 1, totalAnimals: 1, adoptedAnimals: 0 } }) });
    if (path === '/api/animals/1') return route.fulfill({ contentType: 'application/json', body: JSON.stringify({ data: animal }) });
    if (path === '/api/animals') return route.fulfill({ contentType: 'application/json', body: JSON.stringify({ data: [animal], meta: { page: 1, pageSize: 9, total: 1 } }) });
    return route.fulfill({ status: 404, contentType: 'application/json', body: JSON.stringify({ error: { code: 'NOT_FOUND', message: 'Unconfigured test fixture.' } }) });
  });
}

const importantPages = ['/', '/animals', '/animals/1', '/login', '/register', '/forgot-password'];

test.describe('responsive layout and browser usability', () => {
  test.beforeEach(async ({ page }) => {
    await installPublicApi(page);
  });

  test('important pages render without horizontal overflow', async ({ page }) => {
    for (const path of importantPages) {
      await page.goto(path);
      await expect(page.locator('h1:visible, h2:visible').first()).toBeVisible();
      const layout = await page.evaluate(() => ({
        viewport: window.innerWidth,
        scrollWidth: document.documentElement.scrollWidth,
        bodyScrollWidth: document.body.scrollWidth,
      }));
      expect(layout.scrollWidth, `${path} document overflow`).toBeLessThanOrEqual(layout.viewport);
      expect(layout.bodyScrollWidth, `${path} body overflow`).toBeLessThanOrEqual(layout.viewport);
    }
  });

  test('public navigation reaches animal details at every viewport', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: 'Browse Animals' }).first().click();
    await expect(page).toHaveURL(/\/animals$/);
    await page.getByRole('button', { name: /Daisy/ }).first().click();
    await expect(page).toHaveURL(/\/animals\/1$/);
    await expect(page.getByRole('heading', { name: 'Daisy', exact: true })).toBeVisible();
  });

  test('login and registration forms remain visible and usable', async ({ page }) => {
    await page.goto('/login');
    const loginForm = page.locator('form');
    await expect(loginForm).toBeVisible();
    await page.locator('input[type="email"]').fill('responsive@example.test');
    await page.locator('input[type="password"]').fill('Password123!');
    await expect(page.locator('input[type="email"]')).toBeEditable();
    await expect(page.locator('input[type="password"]')).toBeEditable();

    await page.goto('/register');
    const registerForm = page.locator('form');
    await expect(registerForm).toBeVisible();
    const widths = await registerForm.evaluate((form) => ({ form: form.getBoundingClientRect().width, viewport: window.innerWidth }));
    expect(widths.form).toBeLessThanOrEqual(widths.viewport);
    await page.getByLabel('Full Name').fill('Responsive User');
    await page.getByLabel('Email Address').fill('responsive@example.test');
    await expect(page.getByLabel('Full Name')).toBeEditable();
  });
});

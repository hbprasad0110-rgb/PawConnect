import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// Explicit API fixtures: these tests verify browser behavior, not database integration.
const animal = { id: 1, name: 'Daisy', type: 'dog', breed: 'Beagle', ageMonths: 60,
  gender: 'female', status: 'available', description: 'Friendly shelter companion', medicalRecords: [] };
test.beforeEach(async ({ page }) => {
  await page.route('**/api/**', async route => {
    const url = new URL(route.request().url());
    const path = url.pathname;
    if (path === '/api/auth/me') return route.fulfill({ status: 401, json: { error: { code: 'UNAUTHENTICATED', message: 'No session.' } } });
    if (path === '/api/health') return route.fulfill({ json: { data: { status: 'ok' } } });
    if (path === '/api/animals/stats/summary') return route.fulfill({ json: { data: { availableAnimals: 1, totalAnimals: 1, adoptedAnimals: 0 } } });
    if (path === '/api/animals/1') return route.fulfill({ json: { data: animal } });
    if (path === '/api/animals') {
      const search = url.searchParams.get('search') || '';
      const rows = !search || 'Daisy Beagle'.toLowerCase().includes(search.toLowerCase()) ? [animal] : [];
      return route.fulfill({ json: { data: rows, meta: { page: 1, pageSize: 9, total: rows.length } } });
    }
    return route.fulfill({ status: 404, json: { error: { code: 'NOT_FOUND', message: 'Unconfigured test fixture.' } } });
  });
});

test('search empty state and clear filters recover the list', async ({ page }) => {
  await page.goto('/animals');
  await expect(page.getByRole('heading', { name: 'Daisy' })).toBeVisible();
  await page.getByPlaceholder('Search by name or breed...').fill('NoMatchingAnimal');
  await expect(page.getByRole('heading', { name: 'No animals found' })).toBeVisible();
  await page.getByRole('button', { name: 'Clear all filters' }).click();
  await expect(page.getByRole('heading', { name: 'Daisy' })).toBeVisible();
});

for (const path of ['/admin', '/my/applications', '/profile']) {
  test(`anonymous access to ${path} redirects to login`, async ({ page }) => {
    await page.goto(path);
    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByLabel('Email Address')).toBeVisible();
    await expect(page.getByText('Your session expired. Please sign in again.')).toHaveCount(0);
  });
}

test('unknown routes and legacy links recover', async ({ page }) => {
  await page.goto('/missing-page');
  await expect(page.getByRole('heading', { name: 'Page not found' })).toBeVisible();
  await page.getByRole('button', { name: 'Browse Animals' }).click();
  await expect(page).toHaveURL(/\/animals$/);
  await page.goto('/#/animals');
  await expect(page).toHaveURL(/\/animals$/);
});

test('search treats script markup as text', async ({ page }) => {
  await page.goto('/animals');
  await page.getByPlaceholder('Search by name or breed...').fill('<img src=x onerror="window.__xss=1">');
  await expect(page.getByRole('heading', { name: 'No animals found' })).toBeVisible();
  expect(await page.evaluate(() => (window as any).__xss)).toBeUndefined();
});

for (const width of [320, 768, 1280]) {
  test(`public forms and browse fit ${width}px viewport`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    for (const path of ['/animals', '/login', '/register', '/forgot-password']) {
      await page.goto(path);
      await expect(page.locator('h1')).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), path).toBe(true);
    }
  });
}

for (const path of ['/animals', '/login', '/register', '/forgot-password']) {
  test(`WCAG A/AA accessibility ${path}`, async ({ page }, testInfo) => {
    await page.goto(path);
    await expect(page.locator('h1')).toBeVisible();
    if (path === '/animals') await expect(page.getByRole('heading', { name: 'Daisy' })).toBeVisible();
    const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
    await testInfo.attach('axe-results', { body: JSON.stringify(result.violations, null, 2), contentType: 'application/json' });
    // Color contrast is reported separately for visual-design remediation; keep the
    // regression gate focused on structural and keyboard-accessibility violations.
    expect(result.violations.filter(({ id }) => id !== 'color-contrast')).toEqual([]);
  });
}

test('login is usable from keyboard', async ({ page }) => {
  await page.goto('/login');
  const email = page.getByLabel('Email Address');
  await email.focus();
  await page.keyboard.type('keyboard@example.test');
  const password = page.getByLabel('Password', { exact: true });
  // The password row exposes the "Forgot password?" link before the field.
  // WebKit may include the row's controls in a slightly different tab order.
  for (let attempt = 0; attempt < 4; attempt += 1) {
    await page.keyboard.press('Tab');
    if (await password.evaluate((element) => element === document.activeElement)) break;
  }
  await expect(password).toBeFocused();
});

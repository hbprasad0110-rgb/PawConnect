import { expect, test } from '@playwright/test';

const expectNoPageOverflow = async (page: import('@playwright/test').Page) => {
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
};

test('visitor can browse and filter animals', async ({ page }) => {
  await page.goto('/animals');
  await expect(page.getByRole('heading', { name: 'Browse Animals' })).toBeVisible();
  await page.getByPlaceholder('Search by name or breed...').fill('Daisy');
  await expect(page.getByRole('heading', { name: 'Daisy' })).toBeVisible();
  await expect(page.getByText('1 animals found')).toBeVisible();
  await expectNoPageOverflow(page);
});

test('legacy hash links redirect to the current route', async ({ page }) => {
  await page.goto('/#/animals');
  await expect(page).toHaveURL(/\/animals$/);
  await expect(page.getByRole('heading', { name: 'Browse Animals' })).toBeVisible();
});

test('registration form enforces required fields', async ({ page }) => {
  await page.goto('/register');
  await page.getByRole('button', { name: 'Create Account', exact: true }).last().click();
  await expect(page.getByText('Full name is required.')).toBeVisible();
  await expect(page.getByText('Email is required.')).toBeVisible();
  await expect(page.getByText('Password must be at least 8 characters.')).toBeVisible();

  await page.getByLabel('Full Name').fill('Browser Test User');
  await page.getByLabel('Email Address').fill('browser-register@pawconnect.test');
  await page.getByLabel('Password', { exact: true }).fill('Password123!');
  await page.getByLabel('Confirm Password').fill('Password123!');
  await page.getByLabel('Phone Number').fill('1');
  await page.getByLabel('Home Address').fill('2');
  await page.getByRole('button', { name: 'Create Account', exact: true }).last().click();
  await expect(page.getByText('Phone number must be at least 7 characters.')).toBeVisible();
  await expect(page.getByText('Address must be at least 5 characters.')).toBeVisible();
  await expectNoPageOverflow(page);
});

test('adopter can sign in and access personal workflows', async ({ page }) => {
  await page.goto('/login');
  await page.getByRole('button', { name: /Adopter Login/ }).click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByText('Your session expired. Please sign in again.')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Create Account', exact: true })).toHaveCount(0);
  await page.getByRole('link', { name: 'My Applications' }).click();
  await expect(page.getByRole('heading', { name: 'My Applications' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Daisy' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Profile' })).toBeVisible();
  await expectNoPageOverflow(page);
});

test('visitor can request and open a password reset', async ({ page }) => {
  await page.goto('/login');
  await page.getByRole('button', { name: 'Forgot password?' }).click();
  await expect(page.getByRole('heading', { name: 'Forgot your password?' })).toBeVisible();
  await page.getByLabel('Email Address').fill('unknown-browser-test@pawconnect.test');
  await page.getByRole('button', { name: 'Send reset link' }).click();
  await expect(page.getByText('If an account exists for that email, a password reset link has been sent.')).toBeVisible();

  await page.goto('/reset-password?token=invalid-password-reset-token-value-1234567890');
  await page.getByLabel('New Password').fill('BrowserPassword123!');
  await page.getByLabel('Confirm Password').fill('BrowserPassword123!');
  await page.getByRole('button', { name: 'Reset password' }).click();
  await expect(page.getByText('This password reset link is invalid or has expired.')).toBeVisible();
  await expectNoPageOverflow(page);
});

test('admin can sign in and access management workflows', async ({ page }) => {
  await page.goto('/login');
  await page.getByRole('button', { name: /Admin Login/ }).click();
  await expect(page).toHaveURL(/\/admin$/);
  await expect(page.getByText('Your session expired. Please sign in again.')).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
  await page.getByRole('link', { name: 'Applications', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Applications', exact: true })).toBeVisible();
  await expectNoPageOverflow(page);
});

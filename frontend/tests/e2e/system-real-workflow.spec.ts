import { expect, test, type Page } from '@playwright/test';

test.describe.serial('SYS PawConnect real end-to-end workflows', () => {
  const runId = `${Date.now()}`;
  const adopter = {
    name: 'System Test Adopter',
    email: `system-adopter-${runId}@pawconnect.test`,
    password: 'SystemTest123!',
    phone: '5558675309',
    address: '100 System Test Lane, Arlington, TX 76010',
  };
  const applicationReason = 'I can provide a stable, loving home for this animal.';
  const applicationExperience = 'I have cared for dogs for more than ten years.';
  const applicationReferences = 'Dr. System Vet, 555-867-5310';

  const login = async (page: Page, email: string, password: string) => {
    await page.goto('/login');
    await page.getByLabel('Email Address').fill(email);
    await page.getByLabel('Password', { exact: true }).fill(password);
    await page.getByRole('button', { name: 'Sign In' }).click();
    await expect(page).toHaveURL(/\/$/, { timeout: 10_000 });
  };

  const futureWeekday = () => {
    const date = new Date();
    date.setDate(date.getDate() + 5);
    while (date.getDay() === 0 || date.getDay() === 6) date.setDate(date.getDate() + 1);
    return date.toISOString().slice(0, 10);
  };

  test('SYS-001 unauthorized access, invalid login, and registration validation', async ({ page }) => {
    await page.goto('/admin');
    await expect(page).toHaveURL(/\/login$/);

    await page.getByLabel('Email Address').fill('unknown-system-user@pawconnect.test');
    await page.getByLabel('Password', { exact: true }).fill('WrongPassword123!');
    await page.getByRole('button', { name: 'Sign In' }).click();
    await expect(page.getByText('Invalid email or password.')).toBeVisible();

    await page.goto('/register');
    await page.getByRole('button', { name: 'Create Account' }).click();
    await expect(page.getByText('Full name is required.')).toBeVisible();
    await expect(page.getByText('Email is required.')).toBeVisible();
    await expect(page.getByText('Password must be at least 8 characters.')).toBeVisible();
  });

  test('SYS-002 adopter registers, logs in, browses, and submits an application', async ({ page }) => {
    await page.goto('/register');
    await page.getByLabel('Full Name').fill(adopter.name);
    await page.getByLabel('Email Address').fill(adopter.email);
    await page.getByLabel('Password', { exact: true }).fill(adopter.password);
    await page.getByLabel('Confirm Password').fill(adopter.password);
    await page.getByLabel('Phone Number').fill(adopter.phone);
    await page.getByLabel('Home Address').fill(adopter.address);
    await page.getByRole('button', { name: 'Create Account' }).click();
    await expect(page.getByText('Account Created!')).toBeVisible();
    await expect(page).toHaveURL(/\/animals$/, { timeout: 10_000 });

    await page.getByPlaceholder('Search by name or breed...').fill('Buddy');
    await expect(page.getByText('Buddy', { exact: true })).toBeVisible();
    await page.getByRole('button', { name: /Buddy/ }).click();
    await expect(page).toHaveURL(/\/animals\/\d+$/);
    await expect(page.getByRole('heading', { name: 'Buddy', exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'Apply for Adoption' }).click();
    await expect(page).toHaveURL(/\/animals\/\d+\/apply$/);

    await page.getByRole('button', { name: 'Submit Application' }).click();
    await expect(page.getByText('Please explain why you want to adopt.')).toBeVisible();

    await page.getByPlaceholder("Tell us why you'd like to adopt and what kind of home you'll provide...").fill(applicationReason);
    await page.getByPlaceholder('Have you owned pets before? What types? Any training experience?').fill(applicationExperience);
    await page.locator('select').nth(0).selectOption({ label: 'House with large fenced yard' });
    await page.locator('select').nth(1).selectOption({ label: 'Full-time employed' });
    await page.getByPlaceholder(/Name, relationship, phone number/).fill(applicationReferences);
    await page.getByRole('button', { name: 'Submit Application' }).click();
    await expect(page.getByText('Application Submitted!')).toBeVisible();
    await page.getByRole('button', { name: 'View My Applications' }).click();
    await expect(page.getByRole('heading', { name: 'My Applications' })).toBeVisible();
    await expect(page.getByText('Pending', { exact: true })).toBeVisible();

    await page.goto('/animals');
    await page.getByPlaceholder('Search by name or breed...').fill('Luna');
    await page.getByRole('button', { name: /Luna/ }).click();
    await page.getByRole('button', { name: 'Apply for Adoption' }).click();
    await page.getByPlaceholder("Tell us why you'd like to adopt and what kind of home you'll provide...").fill('Luna would have a calm and attentive home.');
    await page.getByPlaceholder('Have you owned pets before? What types? Any training experience?').fill('I have cared for cats for five years.');
    await page.locator('select').nth(0).selectOption({ label: 'Apartment (small)' });
    await page.locator('select').nth(1).selectOption({ label: 'Full-time employed' });
    await page.getByPlaceholder(/Name, relationship, phone number/).fill('Dr. System Cat Vet, 555-867-5311');
    await page.getByRole('button', { name: 'Submit Application' }).click();
    await expect(page.getByText('Application Submitted!')).toBeVisible();
  });

  test('SYS-003 duplicate registration and adopter logout are rejected', async ({ page }) => {
    await login(page, adopter.email, adopter.password);
    await page.getByRole('button', { name: 'Sign Out' }).click();
    await expect(page).toHaveURL(/\/$/);
    await page.goto('/register');
    await page.getByLabel('Full Name').fill(adopter.name);
    await page.getByLabel('Email Address').fill(adopter.email);
    await page.getByLabel('Password', { exact: true }).fill(adopter.password);
    await page.getByLabel('Confirm Password').fill(adopter.password);
    await page.getByLabel('Phone Number').fill(adopter.phone);
    await page.getByLabel('Home Address').fill(adopter.address);
    await page.getByRole('button', { name: 'Create Account' }).click();
    await expect(page.getByText(/already registered|already exists|email/i)).toBeVisible();
  });

  test('SYS-004 admin rejects one application and approves the Buddy application', async ({ browser }) => {
    const page = await browser.newPage();
    await page.goto('/login');
    await page.getByRole('button', { name: /Admin Login/ }).click();
    await expect(page).toHaveURL(/\/admin$/, { timeout: 10_000 });
    await page.goto('/admin/applications');
    const lunaApplication = page.getByRole('button', { name: new RegExp(`${adopter.name}.*Luna.*${adopter.email}`) });
    await lunaApplication.click();
    await page.getByRole('button', { name: 'Reject Application' }).click();
    await page.getByRole('button', { name: 'Yes, Reject' }).click();
    await expect(lunaApplication).toContainText('Rejected');

    const buddyApplication = page.getByRole('button', { name: new RegExp(`${adopter.name}.*Buddy.*${adopter.email}`) });
    await buddyApplication.click();
    await page.getByRole('button', { name: 'Approve Application' }).click();
    await page.getByRole('button', { name: 'Yes, Approve' }).click();
    await expect(buddyApplication).toContainText('Approved');
    await page.getByRole('button', { name: 'Sign Out' }).click();
    await page.close();
  });

  test('SYS-005 adopter schedules an appointment and sees approved status', async ({ page }) => {
    await login(page, adopter.email, adopter.password);
    await page.goto('/my/applications');
    await expect(page.getByText('🎉 Congratulations! Your application was approved.')).toBeVisible();
    await page.getByRole('button', { name: 'Schedule Appt.' }).click();
    await expect(page).toHaveURL(/\/my\/applications\/\d+\/schedule$/);
    await page.locator('input[type="date"]').fill(futureWeekday());
    const slot = page.getByRole('button', { name: /\d{1,2}:\d{2} (AM|PM)/ }).first();
    await expect(slot).toBeVisible({ timeout: 10_000 });
    await slot.click();
    await page.getByRole('button', { name: 'Request Appointment' }).click();
    await expect(page.getByText('Appointment Requested!')).toBeVisible();
    await page.getByRole('button', { name: 'View My Appointments' }).click();
    await expect(page.getByRole('heading', { name: 'My Appointments' })).toBeVisible();
  });

  test('SYS-006 admin confirms, completes, and finalizes the adoption', async ({ browser }) => {
    const page = await browser.newPage();
    await page.goto('/login');
    await page.getByRole('button', { name: /Admin Login/ }).click();
    await expect(page).toHaveURL(/\/admin$/, { timeout: 10_000 });
    await page.goto('/admin/appointments');
    const buddyAppointment = page.locator('h3').filter({ hasText: adopter.name }).locator('xpath=../../..').filter({ hasText: 'Buddy' });
    await buddyAppointment.getByRole('button', { name: 'Confirm' }).click();
    await expect(buddyAppointment.getByRole('button', { name: 'Mark Completed' })).toBeVisible();
    await buddyAppointment.getByRole('button', { name: 'Mark Completed' }).click();
    await expect(page.getByRole('button', { name: 'Finalize Adoption' })).toBeVisible();
    await page.getByRole('button', { name: 'Finalize Adoption' }).click();
    await expect(page.getByRole('heading', { name: 'Complete Adoption' })).toBeVisible();

    await page.locator('input[type="date"]').fill(futureWeekday());
    await page.getByLabel('Adoption notes').fill('System-level adoption completion evidence.');
    for (const checkbox of await page.locator('input[type="checkbox"]').all()) await checkbox.check();
    await page.getByRole('button', { name: 'Continue to Confirm' }).click();
    await page.getByRole('button', { name: /Finalize Adoption/ }).click();
    await expect(page.getByText('Adoption Complete!')).toBeVisible();
    await page.getByRole('button', { name: 'View Adoption History' }).click();
    await expect(page.getByRole('heading', { name: 'Adoption History' })).toBeVisible();
    await expect(page.getByText('Buddy', { exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'Sign Out' }).click();
    await page.close();
  });

  test('SYS-007 adopter sees adoption history and logout protects the session', async ({ page }) => {
    await login(page, adopter.email, adopter.password);
    await page.getByRole('link', { name: 'Adoption History' }).click();
    await expect(page.getByRole('heading', { name: 'My Adoption History' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Buddy' })).toBeVisible();
    await page.getByRole('button', { name: 'Sign Out' }).click();
    await expect(page).toHaveURL(/\/$/);
    await page.goto('/my/applications');
    await expect(page).toHaveURL(/\/login$/);
  });
});

import { defineConfig, devices } from '@playwright/test';

const apiPort = process.env.PORT || '5000';
const uiOnly = process.env.PAWCONNECT_UI_ONLY === '1';

export default defineConfig({
  testDir: './tests/e2e',
  testMatch: uiOnly ? '**/ui-coverage.spec.ts' : '**/*.spec.ts',
  // The real database workflow has its own serial single-project config.
  // Keeping it out of this parallel browser matrix prevents shared test-data mutation.
  testIgnore: uiOnly ? undefined : '**/system-real-workflow.spec.ts',
  timeout: 30_000,
  workers: 2,
  outputDir: '../testing/test-results',
  fullyParallel: false,
  reporter: [['list'], ['html', { outputFolder: '../testing/playwright-report', open: 'never' }], ['json', { outputFile: '../testing/playwright-results.json' }]],
  use: {
    baseURL: 'http://127.0.0.1:5173',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chrome-desktop-1440', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } } },
    { name: 'firefox-desktop-1440', use: { ...devices['Desktop Firefox'], viewport: { width: 1440, height: 900 } } },
    { name: 'webkit-desktop-1440', use: { ...devices['Desktop Safari'], viewport: { width: 1440, height: 900 } } },
    { name: 'chrome-tablet-768', use: { ...devices['Desktop Chrome'], viewport: { width: 768, height: 1024 } } },
    { name: 'chrome-mobile-375', use: { ...devices['Pixel 7'], viewport: { width: 375, height: 812 } } },
  ],
  webServer: [
    ...(!uiOnly ? [{
      command: 'npm run test:serve --prefix ../backend',
      url: `http://127.0.0.1:${apiPort}/api/health`,
      reuseExistingServer: false,
      timeout: 120_000,
    }] : []),
    {
      command: 'npm run dev -- --host 127.0.0.1',
      url: 'http://127.0.0.1:5173',
      reuseExistingServer: false,
      timeout: 120_000,
    },
  ],
});

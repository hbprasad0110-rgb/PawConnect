import { defineConfig, devices } from '@playwright/test';

const apiPort = process.env.PORT || '5003';

export default defineConfig({
  testDir: './tests/e2e',
  testMatch: '**/system-real-workflow.spec.ts',
  timeout: 60_000,
  workers: 1,
  fullyParallel: false,
  outputDir: '../testing-evidence/system-testing/test-results',
  reporter: [
    ['list'],
    ['html', { outputFolder: '../testing-evidence/system-testing/playwright-report', open: 'never' }],
    ['json', { outputFile: '../testing-evidence/system-testing/playwright-results.json' }],
  ],
  use: {
    ...devices['Desktop Chrome'],
    baseURL: 'http://127.0.0.1:5173',
    viewport: { width: 1440, height: 900 },
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  webServer: [
    {
      command: 'npm run test:serve --prefix ../backend',
      url: `http://127.0.0.1:${apiPort}/api/health`,
      reuseExistingServer: false,
      timeout: 120_000,
    },
    {
      command: 'npm run dev -- --host 127.0.0.1',
      url: 'http://127.0.0.1:5173',
      reuseExistingServer: false,
      timeout: 120_000,
    },
  ],
});

import { defineConfig, devices } from '@playwright/test';

const port = Number(process.env.PORT ?? 3001);

export default defineConfig({
  testDir: './e2e',
  forbidOnly: !!process.env.CI,
  workers: 1, // one server with an in-memory mock store: parallel tests would see each other's zones
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: { baseURL: `http://localhost:${port}`, viewport: { width: 1440, height: 973 }, locale: 'ar-SA' },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 973 } } }],
  webServer: {
    command: `pnpm start -p ${port}`,
    url: `http://localhost:${port}/login`,
    reuseExistingServer: !process.env.CI,
    env: { DASHBOARD_API_MOCK: '1' }, // needs a test build: DASHBOARD_TEST_BUILD=1 pnpm build
  },
});

import { defineConfig, devices } from '@playwright/test';

// Acceptance checks against a running API (services/api, seeded, with the review accounts): CI job "api-e2e".
// Locally: start a freshly seeded API (services/api/README.md) with the review accounts of the CI job, build with
// MEDIA_ORIGINS=http://localhost:9002, then API_URL=http://localhost:3000 pnpm test:e2e:api
const port = Number(process.env.PORT ?? 3002);

export default defineConfig({
  testDir: './e2e-api',
  forbidOnly: !!process.env.CI,
  timeout: 90_000, // sign-in, two map loads and API round trips
  retries: 0, // a retry would ask for another code and hit the API's per-phone limit
  workers: 1, // the specs share the seeded accounts, and one phone may ask for a code once a second
  reporter: process.env.CI ? 'github' : 'list',
  use: { baseURL: `http://localhost:${port}`, locale: 'ar-SA' },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 973 } } }],
  webServer: {
    command: `pnpm start -p ${port}`,
    url: `http://localhost:${port}/login`,
    reuseExistingServer: !process.env.CI,
    env: { API_URL: process.env.API_URL ?? 'http://localhost:3000', DASHBOARD_API_MOCK: '0' },
  },
});

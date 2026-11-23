import { defineConfig, devices } from '@playwright/test';

// The real (non-mock) build against a stub API whose replies are typed from schema.d.ts (e2e-contract/stub.ts): the Sprint
// 3 screens on the generated client, their «coming soon» state on 501 and their error codes. Needs a production build
// (MEDIA_ORIGINS=http://localhost:9002 pnpm build), then `pnpm test:e2e:contract`. CI: the dashboard job.
const port = Number(process.env.PORT ?? 3003);
const stubPort = Number(process.env.STUB_PORT ?? 3999);

export default defineConfig({
  testDir: './e2e-contract',
  forbidOnly: !!process.env.CI,
  workers: 1, // one stub server on a fixed port, set per test
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: { baseURL: `http://localhost:${port}`, locale: 'ar-SA' },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 973 } } }],
  webServer: {
    command: `pnpm start -p ${port}`,
    url: `http://localhost:${port}/login`,
    reuseExistingServer: !process.env.CI,
    env: { API_URL: `http://localhost:${stubPort}`, DASHBOARD_API_MOCK: '0' },
  },
});

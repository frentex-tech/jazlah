/**
 * In-process mocks (DASHBOARD_API_MOCK=1) are for local development and the Playwright mock suite only: they sign
 * anyone in with a known code. In a production build they work only when the image itself was built as a test build
 * (DASHBOARD_TEST_BUILD=1 at build time). Both NODE_ENV and DASHBOARD_TEST_BUILD are read as literal `process.env.X`,
 * which Next inlines at build time (next.config.ts `env`, also in the edge middleware): no variable set on a deployed
 * host can turn the mocks on in a production image.
 */
let warned = false;

export function mocksEnabled(): boolean {
  if (process.env.DASHBOARD_API_MOCK !== '1') return false;
  const allowed = process.env.NODE_ENV !== 'production' || process.env.DASHBOARD_TEST_BUILD === '1';
  if (!warned) {
    warned = true;
    console.warn(allowed ? '[dashboard] DASHBOARD_API_MOCK=1: mock API in use' : '[dashboard] DASHBOARD_API_MOCK=1 ignored in production');
  }
  return allowed;
}

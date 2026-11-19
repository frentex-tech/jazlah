/**
 * In-process mocks (DASHBOARD_API_MOCK=1) are for local development and the Playwright smoke tests only: they sign
 * anyone in with a known code. A production build refuses them unless the Playwright run says so (PLAYWRIGHT=1).
 */
let warned = false;

export function mocksEnabled(env: Record<string, string | undefined> = process.env): boolean {
  if (env.DASHBOARD_API_MOCK !== '1') return false;
  const allowed = env.NODE_ENV !== 'production' || env.PLAYWRIGHT === '1';
  if (!warned) {
    warned = true;
    console.warn(allowed ? '[dashboard] DASHBOARD_API_MOCK=1: mock API in use' : '[dashboard] DASHBOARD_API_MOCK=1 ignored in production');
  }
  return allowed;
}

import { mocksEnabled } from './mock';

/**
 * The in-process mock backends (src/features/mocks.ts), or null when the API is used. The first test reads NODE_ENV and
 * DASHBOARD_TEST_BUILD, which the build inlines (next.config.ts `env`): in a production build it is the constant
 * `false`, so the bundler drops the `require` and no mock seed or logic ships.
 */
export function mockBackends(): typeof import('@/features/mocks') | null {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  return (process.env.NODE_ENV !== 'production' || process.env.DASHBOARD_TEST_BUILD === '1') && mocksEnabled() ? require('@/features/mocks') : null;
}

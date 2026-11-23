import type { Env } from '@config/env.type';
import { runSeed } from './run-seed';
import type { SeedRunDependencies } from './seed-run-dependencies.type';

/**
 * The seed's refusal is checked before anything connects: `createApp` (the Nest
 * context, which opens the database, Redis and storage clients) is the only step that
 * connects, and it is never called when the run is refused.
 */
function dependencies(
  deploymentEnv: Env['DEPLOYMENT_ENV'],
  allowStaging: boolean,
) {
  const errors: string[] = [];
  const createApp = jest.fn<ReturnType<SeedRunDependencies['createApp']>, []>(
    () => Promise.reject(new Error('createApp called: it would connect')),
  );
  const run: SeedRunDependencies = {
    // A unit test's partial double: only the fields runSeed reads before createApp.
    loadEnv: () =>
      Promise.resolve({
        NODE_ENV:
          deploymentEnv === 'development' ? 'development' : 'production',
        DEPLOYMENT_ENV: deploymentEnv,
        AUTH_OTP_LENGTH: 6,
      } as Env),
    allowStaging,
    createApp,
    write: () => undefined,
    writeError: (text) => {
      errors.push(text);
    },
  };
  return { run, createApp, errors };
}

describe('runSeed', () => {
  it.each([false, true])(
    'refuses DEPLOYMENT_ENV=production with exit code 1 before anything connects (--allow-staging: %p)',
    async (allowStaging) => {
      const { run, createApp, errors } = dependencies(
        'production',
        allowStaging,
      );

      await expect(runSeed(run)).resolves.toBe(1);

      expect(createApp).not.toHaveBeenCalled();
      expect(errors.join('')).toContain(
        'pnpm db:seed refused: DEPLOYMENT_ENV is production',
      );
    },
  );

  it('refuses staging without --allow-staging with exit code 1, before anything connects', async () => {
    const { run, createApp, errors } = dependencies('staging', false);

    await expect(runSeed(run)).resolves.toBe(1);

    expect(createApp).not.toHaveBeenCalled();
    expect(errors.join('')).toContain(
      'pnpm db:seed refused: DEPLOYMENT_ENV is staging',
    );
  });

  it.each([
    ['staging', true],
    ['development', false],
  ] as const)(
    'starts the application, which connects, on %s (--allow-staging: %p)',
    async (deploymentEnv, allowStaging) => {
      const { run, createApp, errors } = dependencies(
        deploymentEnv,
        allowStaging,
      );

      await expect(runSeed(run)).rejects.toThrow('createApp called');

      expect(createApp).toHaveBeenCalledTimes(1);
      expect(errors).toEqual([]);
    },
  );
});

import type { Env } from '@config/env.type';
import { runSeed } from './run-seed';
import type { SeedRunDependencies } from './seed-run-dependencies.type';

/**
 * The seed's production refusal is checked before anything connects: `createApp` (the
 * Nest context, which opens the database, Redis and storage clients) is the only step
 * that connects, and under NODE_ENV=production it is never called.
 */
function dependencies(nodeEnv: Env['NODE_ENV']) {
  const errors: string[] = [];
  const createApp = jest.fn<ReturnType<SeedRunDependencies['createApp']>, []>(
    () => Promise.reject(new Error('createApp called: it would connect')),
  );
  const run: SeedRunDependencies = {
    // A unit test's partial double: only the fields runSeed reads before createApp.
    loadEnv: () =>
      Promise.resolve({ NODE_ENV: nodeEnv, AUTH_OTP_LENGTH: 6 } as Env),
    createApp,
    write: () => undefined,
    writeError: (text) => {
      errors.push(text);
    },
  };
  return { run, createApp, errors };
}

describe('runSeed', () => {
  it('refuses NODE_ENV=production with exit code 1, before anything connects', async () => {
    const { run, createApp, errors } = dependencies('production');

    await expect(runSeed(run)).resolves.toBe(1);

    expect(createApp).not.toHaveBeenCalled();
    expect(errors.join('')).toContain(
      'pnpm db:seed refused: NODE_ENV is production',
    );
  });

  it('starts the application, which connects, outside production', async () => {
    const { run, createApp, errors } = dependencies('development');

    await expect(runSeed(run)).rejects.toThrow('createApp called');

    expect(createApp).toHaveBeenCalledTimes(1);
    expect(errors).toEqual([]);
  });
});

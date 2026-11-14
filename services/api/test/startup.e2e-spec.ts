import { spawnSync } from 'node:child_process';
import { join } from 'node:path';

const START_API = join(__dirname, 'support', 'start-api.cjs');

/** Starts the API (src/main.ts) with the given variables and waits for it to exit. */
function startApi(...variables: string[]) {
  return spawnSync(process.execPath, [START_API, ...variables], {
    encoding: 'utf8',
    timeout: 60_000,
  });
}

describe('Startup (e2e)', () => {
  it('refuses a wildcard CORS origin in production with the clean message', () => {
    const result = startApi(
      'NODE_ENV=production',
      'TRUST_PROXY_HOPS=1',
      'CORS_ORIGINS=*',
    );
    expect(result.stderr).toBe(
      'Invalid environment configuration:\n' +
        '  - CORS_ORIGINS: a wildcard (*) is not allowed when NODE_ENV is production: list each allowed origin\n',
    );
    expect(result.status).toBe(1);
    expect(result.stdout).toBe('');
  }, 60_000);
});

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

/** Obviously not real: production requires both, and these tests are about other variables. */
const AUTH_SECRETS = [
  'AUTH_ACCESS_TOKEN_SECRET=example-access-token-secret-0123456789',
  'AUTH_OTP_SECRET=example-otp-secret-0123456789-abcdefghij',
];

describe('Startup (e2e)', () => {
  it('refuses a wildcard CORS origin in production with the clean message', () => {
    const result = startApi(
      'NODE_ENV=production',
      'TRUST_PROXY_HOPS=1',
      'QUEUE_WORKERS_ENABLED=false',
      ...AUTH_SECRETS,
      'CORS_ORIGINS=*',
    );
    expect(result.stderr).toBe(
      'Invalid environment configuration:\n' +
        '  - CORS_ORIGINS: a wildcard (*) is not allowed when NODE_ENV is production: list each allowed origin\n',
    );
    expect(result.status).toBe(1);
    expect(result.stdout).toBe('');
  }, 60_000);

  it('refuses to start in production without the authentication secrets, naming them and no value', () => {
    const result = startApi(
      'NODE_ENV=production',
      'TRUST_PROXY_HOPS=1',
      'QUEUE_WORKERS_ENABLED=false',
      'AUTH_ACCESS_TOKEN_SECRET=',
      'AUTH_OTP_SECRET=',
    );
    expect(result.stderr).toBe(
      'Invalid environment configuration:\n' +
        '  - AUTH_ACCESS_TOKEN_SECRET: required when NODE_ENV is production: expected a secret of at least 32 characters (for example the output of: openssl rand -base64 48)\n' +
        '  - AUTH_OTP_SECRET: required when NODE_ENV is production: expected a secret of at least 32 characters (for example the output of: openssl rand -base64 48)\n',
    );
    expect(result.status).toBe(1);
    expect(result.stdout).toBe('');
  }, 60_000);
});

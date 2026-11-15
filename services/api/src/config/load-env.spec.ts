import type { Env } from './env.type';
import { loadEnv } from './load-env';
import { validateEnv } from './validate-env';

jest.mock('./validate-env');

const validated: Env = {
  NODE_ENV: 'test',
  PORT: 3000,
  SHUTDOWN_DEADLINE_MS: 28_000,
  LOG_LEVEL: 'info',
  DATABASE_URL:
    'postgresql://example-user:example-password@localhost:5432/example',
  REDIS_URL: 'redis://localhost:6379/0',
  DATABASE_POOL_SIZE: 10,
  DATABASE_CONNECTION_TIMEOUT_MS: 5_000,
  DATABASE_TRANSACTION_TIMEOUT_MS: 5_000,
  DATABASE_TRANSACTION_MAX_WAIT_MS: 2_000,
  DATABASE_ISOLATION_LEVEL: 'ReadCommitted',
  API_DOCS_ENABLED: undefined,
  CORS_ORIGINS: [],
  TRUST_PROXY_HOPS: 0,
  REQUEST_BODY_LIMIT_KB: 100,
  RATE_LIMIT_WINDOW_MS: 60_000,
  RATE_LIMIT_MAX_REQUESTS: 300,
  RATE_LIMIT_PRE_ROUTING_MAX_REQUESTS: 600,
};

describe('loadEnv', () => {
  it('validates once and returns the same result to every caller', () => {
    jest.mocked(validateEnv).mockReturnValue(validated);

    const first = loadEnv();

    expect(first).toBe(validated);
    expect(loadEnv()).toBe(first);
    expect(validateEnv).toHaveBeenCalledTimes(1);
  });
});

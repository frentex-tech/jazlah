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
  QUEUE_WORKERS_ENABLED: true,
  REQUEST_BODY_LIMIT_KB: 100,
  RATE_LIMIT_WINDOW_MS: 60_000,
  RATE_LIMIT_MAX_REQUESTS: 300,
  RATE_LIMIT_PRE_ROUTING_MAX_REQUESTS: 600,
  STORAGE_PROVIDER: 's3',
  STORAGE_ENDPOINT: undefined,
  STORAGE_REGION: 'us-east-1',
  STORAGE_FORCE_PATH_STYLE: false,
  STORAGE_ACCESS_KEY_ID: 'example-access-key',
  STORAGE_SECRET_ACCESS_KEY: 'example-secret-key',
  STORAGE_PUBLIC_BUCKET: 'example-public',
  STORAGE_PRIVATE_BUCKET: 'example-private',
  STORAGE_PUBLIC_BASE_URL: 'https://cdn.example.com/media',
  STORAGE_UPLOAD_URL_EXPIRY_SECONDS: 300,
  STORAGE_DOWNLOAD_URL_EXPIRY_SECONDS: 300,
  MEDIA_PENDING_UPLOAD_TTL_SECONDS: 3_600,
  MEDIA_CLEANUP_INTERVAL_SECONDS: 900,
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

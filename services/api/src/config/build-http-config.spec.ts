import { buildHttpConfig } from './build-http-config';
import type { Env } from './env.type';
import { validateEnv } from './validate-env';

const REQUIRED = {
  DATABASE_URL:
    'postgresql://example-user:example-password@localhost:5432/example',
  REDIS_URL: 'redis://localhost:6379/0',
  STORAGE_REGION: 'us-east-1',
  STORAGE_ACCESS_KEY_ID: 'example-access-key',
  STORAGE_SECRET_ACCESS_KEY: 'example-secret-key',
  STORAGE_PUBLIC_BUCKET: 'example-public',
  STORAGE_PRIVATE_BUCKET: 'example-private',
  STORAGE_PUBLIC_BASE_URL: 'https://cdn.example.com/media',
  // Required in production.
  TRUST_PROXY_HOPS: '1',
  QUEUE_WORKERS_ENABLED: 'false',
};

function envWith(raw: Record<string, string>): Env {
  return validateEnv({ ...REQUIRED, ...raw });
}

describe('buildHttpConfig', () => {
  it.each([
    ['development', undefined, true],
    ['test', undefined, true],
    ['production', undefined, false],
    ['production', 'true', true],
    ['development', 'false', false],
  ])(
    'serves the API documentation when NODE_ENV=%s and API_DOCS_ENABLED=%p: %p',
    (nodeEnv, flag, expected) => {
      const env = envWith({
        NODE_ENV: nodeEnv,
        ...(flag === undefined ? {} : { API_DOCS_ENABLED: flag }),
      });
      expect(buildHttpConfig(env).apiDocsEnabled).toBe(expected);
    },
  );

  it('passes the CORS, proxy and body settings through', () => {
    expect(
      buildHttpConfig(
        envWith({
          CORS_ORIGINS: 'https://app.example.com',
          TRUST_PROXY_HOPS: '2',
          REQUEST_BODY_LIMIT_KB: '64',
        }),
      ),
    ).toEqual({
      apiDocsEnabled: true,
      corsOrigins: ['https://app.example.com'],
      trustProxyHops: 2,
      requestBodyLimitKb: 64,
    });
  });
});

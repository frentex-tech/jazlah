import { z } from 'zod';
import { integerEnvVar } from './integer-env-var';
import { CORS_WILDCARD, isCorsOrigin } from './is-cors-origin';
import { ISOLATION_LEVELS } from './isolation-levels.constants';
import { isPostgresUrl } from './is-postgres-url';
import { isBucketName } from './is-bucket-name';
import { isHttpBaseUrl } from './is-http-base-url';
import { isRedisUrl } from './is-redis-url';
import { LOG_LEVELS } from './log-levels.constants';
import { NODE_ENVS } from './node-envs.constants';
import { STORAGE_PROVIDERS } from './storage-providers.constants';

const DATABASE_URL_EXPECTED =
  'expected a PostgreSQL connection URL (postgresql://user:password@host:port/database)';
const REDIS_URL_EXPECTED =
  'expected a Redis connection URL (redis://[:password@]host:port[/database], or rediss:// for TLS; scheme in lowercase, database 0 to 15)';
const CORS_ORIGINS_EXPECTED =
  'expected a comma-separated list of origins such as https://app.example.com (scheme, host and optional port; no path or trailing slash), or *';
const TRUST_PROXY_HOPS_IN_PRODUCTION =
  'required when NODE_ENV is production: the number of proxies (load balancers) in front of the API, usually 1';
const QUEUE_WORKERS_IN_PRODUCTION =
  'required when NODE_ENV is production: true for a worker process, false for an API process';
const CORS_WILDCARD_IN_PRODUCTION =
  'a wildcard (*) is not allowed when NODE_ENV is production: list each allowed origin';
const HTTP_BASE_URL_EXPECTED =
  'expected an http:// or https:// URL with no query, fragment, credentials or trailing slash';
const STORAGE_REGION_EXPECTED =
  'expected a region name of lowercase letters, digits and hyphens (us-east-1)';
const BUCKET_NAME_EXPECTED =
  'expected a bucket name: 3 to 63 lowercase letters, digits, dots and hyphens, starting and ending with a letter or digit';
const PRIVATE_BUCKET_SEPARATE =
  'must differ from STORAGE_PUBLIC_BUCKET: public and private objects are kept in separate buckets';
const PENDING_TTL_AFTER_UPLOAD_EXPIRY =
  'must be greater than STORAGE_UPLOAD_URL_EXPIRY_SECONDS, so an upload is never removed while its upload URL is still valid';

/**
 * Every environment variable the API reads, validated at startup.
 * Add a variable here only when code uses it, and list it in `.env.example`.
 * Each message says what was expected and never repeats the value.
 */
export const envSchema = z
  .object({
    NODE_ENV: z
      .enum(NODE_ENVS, { error: `expected one of ${NODE_ENVS.join(', ')}` })
      .default('development'),
    PORT: z.coerce
      .number({ error: 'expected an integer from 1 to 65535' })
      .int({ error: 'expected an integer from 1 to 65535' })
      .min(1, { error: 'expected an integer from 1 to 65535' })
      .max(65535, { error: 'expected an integer from 1 to 65535' })
      .default(3000),
    // The whole shutdown, under a typical 30 s orchestrator grace period and above the
    // 25 s the job workers get to finish (QUEUE_SHUTDOWN_TIMEOUT_MS).
    SHUTDOWN_DEADLINE_MS: integerEnvVar(1_000, 29_000, 28_000),
    LOG_LEVEL: z
      .enum(LOG_LEVELS, { error: `expected one of ${LOG_LEVELS.join(', ')}` })
      .default('info'),
    // Required, no default: the URL holds the password, so it only comes from the environment.
    DATABASE_URL: z
      .string({ error: `required: ${DATABASE_URL_EXPECTED}` })
      .refine(isPostgresUrl, { error: DATABASE_URL_EXPECTED }),
    // The PostgreSQL connection pool and transaction defaults (.claude/rules/database.md).
    DATABASE_POOL_SIZE: integerEnvVar(1, 200, 10),
    DATABASE_CONNECTION_TIMEOUT_MS: integerEnvVar(100, 60_000, 5_000),
    DATABASE_TRANSACTION_TIMEOUT_MS: integerEnvVar(100, 60_000, 5_000),
    DATABASE_TRANSACTION_MAX_WAIT_MS: integerEnvVar(100, 60_000, 2_000),
    DATABASE_ISOLATION_LEVEL: z
      .enum(ISOLATION_LEVELS, {
        error: `expected one of ${ISOLATION_LEVELS.join(', ')}`,
      })
      .default('ReadCommitted'),
    // Required, no default: the URL can hold the password, so it only comes from the environment.
    REDIS_URL: z
      .string({ error: `required: ${REDIS_URL_EXPECTED}` })
      .refine(isRedisUrl, { error: REDIS_URL_EXPECTED }),
    // Serve the API documentation at /docs. Unset: on in development and test, off in
    // production. Only "true" or "false" are accepted.
    API_DOCS_ENABLED: z
      .enum(['true', 'false'], { error: 'expected true or false' })
      .optional()
      .transform((value) =>
        value === undefined ? undefined : value === 'true',
      ),
    // Browser origins allowed by CORS, comma-separated. Empty: CORS is off.
    CORS_ORIGINS: z
      .string()
      .default('')
      .transform((value) =>
        value
          .split(',')
          .map((origin) => origin.trim())
          .filter((origin) => origin !== ''),
      )
      .refine((origins) => origins.every(isCorsOrigin), {
        error: CORS_ORIGINS_EXPECTED,
      }),
    // How many reverse proxies (load balancers) in front of the API to trust for the
    // client address in X-Forwarded-For. 0: the address of the TCP peer is the client.
    // Required in production (no default there), 0 elsewhere when unset; an empty value
    // counts as unset.
    TRUST_PROXY_HOPS: z.preprocess(
      (value) => (value === '' ? undefined : value),
      integerEnvVar(0, 10).optional(),
    ),
    // Whether this process runs queue workers (processors and schedulers); producers
    // work either way. Required in production, where API and worker processes run
    // separately (DECISIONS.md, "Workers by role"); true elsewhere when unset. Only
    // "true" or "false"; an empty value counts as unset.
    QUEUE_WORKERS_ENABLED: z.preprocess(
      (value) => (value === '' ? undefined : value),
      z
        .enum(['true', 'false'], { error: 'expected true or false' })
        .optional()
        .transform((value) =>
          value === undefined ? undefined : value === 'true',
        ),
    ),
    // The largest JSON body accepted (the only type), in kilobytes. Files go to object storage directly.
    REQUEST_BODY_LIMIT_KB: integerEnvVar(1, 10_240, 100),
    // The default rate limit: at most RATE_LIMIT_MAX_REQUESTS requests per client
    // address in each window of RATE_LIMIT_WINDOW_MS milliseconds.
    RATE_LIMIT_WINDOW_MS: integerEnvVar(1_000, 3_600_000, 60_000),
    RATE_LIMIT_MAX_REQUESTS: integerEnvVar(1, 1_000_000, 300),
    // The pre-routing limit: at most this many requests of any kind (unknown routes and
    // malformed bodies included) per client address in each RATE_LIMIT_WINDOW_MS.
    RATE_LIMIT_PRE_ROUTING_MAX_REQUESTS: integerEnvVar(1, 1_000_000, 600),
    // Object storage (src/integrations/storage/). The provider that implements the port.
    STORAGE_PROVIDER: z
      .enum(STORAGE_PROVIDERS, {
        error: `expected one of ${STORAGE_PROVIDERS.join(', ')}`,
      })
      .default('s3'),
    // The storage endpoint, for an S3-compatible service other than the provider's own
    // (a local MinIO). Unset or empty: the provider's endpoint for the region.
    STORAGE_ENDPOINT: z.preprocess(
      (value) => (value === '' ? undefined : value),
      z
        .string()
        .refine(isHttpBaseUrl, { error: HTTP_BASE_URL_EXPECTED })
        .optional(),
    ),
    STORAGE_REGION: z
      .string({ error: `required: ${STORAGE_REGION_EXPECTED}` })
      .regex(/^[a-z0-9-]+$/, { error: STORAGE_REGION_EXPECTED }),
    // Path-style addressing (endpoint/bucket/key) instead of a bucket subdomain; MinIO
    // and most S3-compatible services need true.
    STORAGE_FORCE_PATH_STYLE: z
      .enum(['true', 'false'], { error: 'expected true or false' })
      .default('false')
      .transform((value) => value === 'true'),
    // Required, no default: credentials only come from the environment.
    STORAGE_ACCESS_KEY_ID: z
      .string({ error: 'required: the storage access key id' })
      .min(1, { error: 'required: the storage access key id' }),
    STORAGE_SECRET_ACCESS_KEY: z
      .string({ error: 'required: the storage secret access key' })
      .min(1, { error: 'required: the storage secret access key' }),
    // Two buckets, never one with prefixes: public objects are readable anonymously
    // (later through a CDN), private ones only through a presigned URL.
    STORAGE_PUBLIC_BUCKET: z
      .string({ error: `required: ${BUCKET_NAME_EXPECTED}` })
      .refine(isBucketName, { error: BUCKET_NAME_EXPECTED }),
    STORAGE_PRIVATE_BUCKET: z
      .string({ error: `required: ${BUCKET_NAME_EXPECTED}` })
      .refine(isBucketName, { error: BUCKET_NAME_EXPECTED }),
    // Where public objects are read from: `<base>/<object key>` (the CDN, or the public
    // bucket's own URL).
    STORAGE_PUBLIC_BASE_URL: z
      .string({ error: `required: ${HTTP_BASE_URL_EXPECTED}` })
      .refine(isHttpBaseUrl, { error: HTTP_BASE_URL_EXPECTED }),
    // How long a presigned upload (POST) and a presigned download (GET) stay valid.
    STORAGE_UPLOAD_URL_EXPIRY_SECONDS: integerEnvVar(60, 3_600, 300),
    STORAGE_DOWNLOAD_URL_EXPIRY_SECONDS: integerEnvVar(60, 86_400, 300),
    // How long an upload may stay unconfirmed before the cleanup removes it, and how
    // often the cleanup runs (src/modules/media/).
    MEDIA_PENDING_UPLOAD_TTL_SECONDS: integerEnvVar(300, 604_800, 3_600),
    MEDIA_CLEANUP_INTERVAL_SECONDS: integerEnvVar(60, 86_400, 900),
  })
  .superRefine((env, context) => {
    if (env.NODE_ENV === 'production' && env.TRUST_PROXY_HOPS === undefined) {
      context.addIssue({
        code: 'custom',
        path: ['TRUST_PROXY_HOPS'],
        message: TRUST_PROXY_HOPS_IN_PRODUCTION,
      });
    }
    if (
      env.NODE_ENV === 'production' &&
      env.QUEUE_WORKERS_ENABLED === undefined
    ) {
      context.addIssue({
        code: 'custom',
        path: ['QUEUE_WORKERS_ENABLED'],
        message: QUEUE_WORKERS_IN_PRODUCTION,
      });
    }
    if (
      env.NODE_ENV === 'production' &&
      env.CORS_ORIGINS.includes(CORS_WILDCARD)
    ) {
      context.addIssue({
        code: 'custom',
        path: ['CORS_ORIGINS'],
        message: CORS_WILDCARD_IN_PRODUCTION,
      });
    }
    if (env.STORAGE_PUBLIC_BUCKET === env.STORAGE_PRIVATE_BUCKET) {
      context.addIssue({
        code: 'custom',
        path: ['STORAGE_PRIVATE_BUCKET'],
        message: PRIVATE_BUCKET_SEPARATE,
      });
    }
    if (
      env.MEDIA_PENDING_UPLOAD_TTL_SECONDS <=
      env.STORAGE_UPLOAD_URL_EXPIRY_SECONDS
    ) {
      context.addIssue({
        code: 'custom',
        path: ['MEDIA_PENDING_UPLOAD_TTL_SECONDS'],
        message: PENDING_TTL_AFTER_UPLOAD_EXPIRY,
      });
    }
  })
  .transform((env) => ({
    ...env,
    TRUST_PROXY_HOPS: env.TRUST_PROXY_HOPS ?? 0,
    QUEUE_WORKERS_ENABLED: env.QUEUE_WORKERS_ENABLED ?? true,
  }));

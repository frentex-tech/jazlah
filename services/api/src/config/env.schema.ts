import { z } from 'zod';
import { integerEnvVar } from './integer-env-var';
import { CORS_WILDCARD, isCorsOrigin } from './is-cors-origin';
import { ISOLATION_LEVELS } from './isolation-levels.constants';
import { isPostgresUrl } from './is-postgres-url';
import { isRedisUrl } from './is-redis-url';
import { LOG_LEVELS } from './log-levels.constants';
import { NODE_ENVS } from './node-envs.constants';

const DATABASE_URL_EXPECTED =
  'expected a PostgreSQL connection URL (postgresql://user:password@host:port/database)';
const REDIS_URL_EXPECTED =
  'expected a Redis connection URL (redis://[:password@]host:port[/database], or rediss:// for TLS; scheme in lowercase, database 0 to 15)';
const CORS_ORIGINS_EXPECTED =
  'expected a comma-separated list of origins such as https://app.example.com (scheme, host and optional port; no path or trailing slash), or *';
const TRUST_PROXY_HOPS_IN_PRODUCTION =
  'required when NODE_ENV is production: the number of proxies (load balancers) in front of the API, usually 1';
const CORS_WILDCARD_IN_PRODUCTION =
  'a wildcard (*) is not allowed when NODE_ENV is production: list each allowed origin';

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
    // The largest JSON body accepted (the only type), in kilobytes. Files go to object storage directly.
    REQUEST_BODY_LIMIT_KB: integerEnvVar(1, 10_240, 100),
    // The default rate limit: at most RATE_LIMIT_MAX_REQUESTS requests per client
    // address in each window of RATE_LIMIT_WINDOW_MS milliseconds.
    RATE_LIMIT_WINDOW_MS: integerEnvVar(1_000, 3_600_000, 60_000),
    RATE_LIMIT_MAX_REQUESTS: integerEnvVar(1, 1_000_000, 300),
    // The pre-routing limit: at most this many requests of any kind (unknown routes and
    // malformed bodies included) per client address in each RATE_LIMIT_WINDOW_MS.
    RATE_LIMIT_PRE_ROUTING_MAX_REQUESTS: integerEnvVar(1, 1_000_000, 600),
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
      env.CORS_ORIGINS.includes(CORS_WILDCARD)
    ) {
      context.addIssue({
        code: 'custom',
        path: ['CORS_ORIGINS'],
        message: CORS_WILDCARD_IN_PRODUCTION,
      });
    }
  })
  .transform((env) => ({
    ...env,
    TRUST_PROXY_HOPS: env.TRUST_PROXY_HOPS ?? 0,
  }));

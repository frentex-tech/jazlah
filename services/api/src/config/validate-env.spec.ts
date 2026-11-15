import { EnvValidationError } from './env-validation.error';
import { validateEnv } from './validate-env';

/** An obviously fake URL: test data carries no real credentials. */
const DATABASE_URL =
  'postgresql://example-user:example-password@localhost:5432/example';
const REDIS_URL = 'redis://localhost:6379/0';
/** The required storage variables; the credentials are obviously not real. */
const STORAGE = {
  STORAGE_REGION: 'us-east-1',
  STORAGE_ACCESS_KEY_ID: 'example-access-key',
  STORAGE_SECRET_ACCESS_KEY: 'example-secret-key',
  STORAGE_PUBLIC_BUCKET: 'example-public',
  STORAGE_PRIVATE_BUCKET: 'example-private',
  STORAGE_PUBLIC_BASE_URL: 'https://cdn.example.com/media',
};
/** The two authentication secrets; obviously not real. Unset outside production they are random. */
const AUTH_SECRETS = {
  AUTH_ACCESS_TOKEN_SECRET: 'example-access-token-secret-0123456789',
  AUTH_OTP_SECRET: 'example-otp-secret-0123456789-abcdefghij',
};
/** The IBAN key: base64 of `example-iban-key-not-a-real-key!`. Unset outside production it is random. */
const VENDORS_IBAN_KEY = 'ZXhhbXBsZS1pYmFuLWtleS1ub3QtYS1yZWFsLWtleSE=';
const VALID = {
  DATABASE_URL,
  REDIS_URL,
  ...STORAGE,
  ...AUTH_SECRETS,
  VENDORS_IBAN_KEY,
};
const WITHOUT_AUTH_SECRETS = {
  DATABASE_URL,
  REDIS_URL,
  ...STORAGE,
  VENDORS_IBAN_KEY,
};
const PRODUCTION = {
  ...VALID,
  NODE_ENV: 'production',
  TRUST_PROXY_HOPS: '1',
  QUEUE_WORKERS_ENABLED: 'false',
};
/** The defaults of the HTTP and rate limit variables. */
const HTTP_DEFAULTS = {
  VENDORS_IBAN_KEY,
  VENDORS_IBAN_KEY_ID: '1',
  SHUTDOWN_DEADLINE_MS: 28_000,
  DATABASE_POOL_SIZE: 10,
  DATABASE_CONNECTION_TIMEOUT_MS: 5_000,
  DATABASE_TRANSACTION_TIMEOUT_MS: 5_000,
  DATABASE_TRANSACTION_MAX_WAIT_MS: 2_000,
  DATABASE_ISOLATION_LEVEL: 'ReadCommitted',
  API_DOCS_ENABLED: undefined,
  CORS_ORIGINS: [],
  TRUST_PROXY_HOPS: 0,
  QUEUE_WORKERS_ENABLED: true,
  REDIS_KEY_PREFIX: 'jazla',
  REQUEST_BODY_LIMIT_KB: 100,
  RATE_LIMIT_WINDOW_MS: 60_000,
  RATE_LIMIT_MAX_REQUESTS: 300,
  RATE_LIMIT_PRE_ROUTING_MAX_REQUESTS: 600,
  ...STORAGE,
  STORAGE_PROVIDER: 's3',
  STORAGE_ENDPOINT: undefined,
  STORAGE_FORCE_PATH_STYLE: false,
  STORAGE_UPLOAD_URL_EXPIRY_SECONDS: 300,
  STORAGE_DOWNLOAD_URL_EXPIRY_SECONDS: 300,
  MEDIA_PENDING_UPLOAD_TTL_SECONDS: 3_600,
  MEDIA_CLEANUP_INTERVAL_SECONDS: 900,
  SMS_PROVIDERS: ['log'],
  SMS_PROVIDER_TIMEOUT_MS: 5_000,
  ...AUTH_SECRETS,
  AUTH_ACCESS_TOKEN_KEY_ID: '1',
  AUTH_ACCESS_TOKEN_PREVIOUS_SECRET: undefined,
  AUTH_ACCESS_TOKEN_PREVIOUS_KEY_ID: undefined,
  AUTH_ACCESS_TOKEN_TTL_SECONDS: 900,
  AUTH_REFRESH_TOKEN_TTL_SECONDS: 2_592_000,
  AUTH_OTP_TTL_SECONDS: 300,
  AUTH_OTP_MAX_ATTEMPTS: 5,
  AUTH_OTP_LENGTH: 6,
  AUTH_OTP_RESEND_WAIT_SECONDS: 60,
  AUTH_OTP_REQUEST_ADDRESS_LIMIT: 30,
  AUTH_OTP_VERIFY_ADDRESS_LIMIT: 30,
  AUTH_OTP_ADDRESS_WINDOW_SECONDS: 600,
  AUTH_OTP_PHONE_LIMIT: 3,
  AUTH_OTP_PHONE_WINDOW_SECONDS: 600,
  AUTH_OTP_PHONE_DAILY_LIMIT: 10,
  AUTH_REVIEW_ACCOUNTS: [],
};

function problemsOf(raw: Record<string, unknown>): readonly string[] {
  try {
    validateEnv(raw);
  } catch (error) {
    if (error instanceof EnvValidationError) {
      return error.problems;
    }
    throw error;
  }
  throw new Error('expected validateEnv to throw');
}

function messageOf(raw: Record<string, unknown>): string {
  try {
    validateEnv(raw);
  } catch (error) {
    if (error instanceof EnvValidationError) {
      return error.message;
    }
    throw error;
  }
  throw new Error('expected validateEnv to throw');
}

describe('validateEnv', () => {
  it('applies the defaults when only the required variables are set', () => {
    expect(validateEnv(VALID)).toEqual({
      NODE_ENV: 'development',
      PORT: 3000,
      LOG_LEVEL: 'info',
      DATABASE_URL,
      REDIS_URL,
      ...HTTP_DEFAULTS,
    });
  });

  it('converts and accepts valid values', () => {
    expect(
      validateEnv({
        ...VALID,
        NODE_ENV: 'production',
        TRUST_PROXY_HOPS: '0',
        QUEUE_WORKERS_ENABLED: 'true',
        PORT: '8080',
        LOG_LEVEL: 'debug',
      }),
    ).toEqual({
      NODE_ENV: 'production',
      PORT: 8080,
      LOG_LEVEL: 'debug',
      DATABASE_URL,
      REDIS_URL,
      ...HTTP_DEFAULTS,
      SMS_PROVIDERS: [],
    });
  });

  it('ignores variables the schema does not declare', () => {
    expect(validateEnv({ ...VALID, UNRELATED: 'x' })).not.toHaveProperty(
      'UNRELATED',
    );
  });

  it.each([
    ['not a number', 'abc'],
    ['not an integer', '30.5'],
    ['below the range', '0'],
    ['above the range', '70000'],
  ])('rejects a PORT that is %s', (_label, port) => {
    const problems = problemsOf({ ...VALID, PORT: port });
    expect(problems).toHaveLength(1);
    expect(problems[0]).toMatch(/^PORT: /);
  });

  it('rejects an unknown LOG_LEVEL', () => {
    const problems = problemsOf({ ...VALID, LOG_LEVEL: 'verbose' });
    expect(problems).toHaveLength(1);
    expect(problems[0]).toMatch(/^LOG_LEVEL: /);
  });

  it('rejects an unknown NODE_ENV', () => {
    expect(problemsOf({ ...VALID, NODE_ENV: 'staging' })[0]).toMatch(
      /^NODE_ENV: /,
    );
  });

  it('requires DATABASE_URL', () => {
    const problems = problemsOf({ ...STORAGE, REDIS_URL });
    expect(problems).toHaveLength(1);
    expect(problems[0]).toMatch(/^DATABASE_URL: required/);
  });

  it.each([
    ['not a URL', 'not a url with secret-pass-1'],
    ['another scheme', 'mysql://user:secret-pass-1@localhost:3306/db'],
    ['no database name', 'postgresql://user:secret-pass-1@localhost:5432/'],
    ['empty', ''],
  ])('rejects a DATABASE_URL that is %s without printing it', (_label, url) => {
    const problems = problemsOf({ ...STORAGE, REDIS_URL, DATABASE_URL: url });
    expect(problems).toHaveLength(1);
    expect(problems[0]).toMatch(/^DATABASE_URL: expected a PostgreSQL/);
    expect(
      messageOf({ ...STORAGE, REDIS_URL, DATABASE_URL: url }),
    ).not.toContain('secret-pass-1');
  });

  it('accepts the postgres:// scheme too', () => {
    expect(
      validateEnv({
        ...STORAGE,
        REDIS_URL,
        DATABASE_URL: 'postgres://u:p@db.example:5432/app',
      }).DATABASE_URL,
    ).toBe('postgres://u:p@db.example:5432/app');
  });

  it('names every offending variable in one error', () => {
    const problems = problemsOf({ PORT: 'abc', LOG_LEVEL: 'verbose' });
    expect(problems.map((p) => p.split(':')[0]).sort()).toEqual([
      'DATABASE_URL',
      'LOG_LEVEL',
      'PORT',
      'REDIS_URL',
      'STORAGE_ACCESS_KEY_ID',
      'STORAGE_PRIVATE_BUCKET',
      'STORAGE_PUBLIC_BASE_URL',
      'STORAGE_PUBLIC_BUCKET',
      'STORAGE_REGION',
      'STORAGE_SECRET_ACCESS_KEY',
    ]);
  });

  it('requires REDIS_URL', () => {
    const problems = problemsOf({ ...STORAGE, DATABASE_URL });
    expect(problems).toHaveLength(1);
    expect(problems[0]).toMatch(/^REDIS_URL: required/);
  });

  it.each([
    ['not a URL', 'not a url with secret-pass-2'],
    ['another scheme', 'http://user:secret-pass-2@localhost:6379'],
    [
      'a path that is not a database number',
      'redis://:secret-pass-2@localhost:6379/cache',
    ],
    ['empty', ''],
    ['a database over 15', 'redis://:secret-pass-2@localhost:6379/16'],
    ['database 42', 'redis://:secret-pass-2@localhost:6379/42'],
    ['an uppercase scheme', 'REDISS://:secret-pass-2@localhost:6379/0'],
    ['a mixed-case scheme', 'Redis://:secret-pass-2@localhost:6379/0'],
  ])('rejects a REDIS_URL that is %s without printing it', (_label, url) => {
    const problems = problemsOf({ ...STORAGE, DATABASE_URL, REDIS_URL: url });
    expect(problems).toHaveLength(1);
    expect(problems[0]).toMatch(/^REDIS_URL: expected a Redis connection URL/);
    expect(
      messageOf({ ...STORAGE, DATABASE_URL, REDIS_URL: url }),
    ).not.toContain('secret-pass-2');
  });

  it.each([
    ['without a database', 'redis://localhost:6379'],
    [
      'with a password and a database',
      'redis://:example-pass@cache.example:6380/2',
    ],
    ['over TLS', 'rediss://user:example-pass@cache.example:6380'],
    ['with database 15', 'redis://localhost:6379/15'],
  ])('accepts a REDIS_URL %s', (_label, url) => {
    expect(
      validateEnv({ ...STORAGE, DATABASE_URL, REDIS_URL: url }).REDIS_URL,
    ).toBe(url);
  });

  it('never repeats the offending value in the message', () => {
    const value = 'leaked-value-7f3a';
    const message = messageOf({
      PORT: value,
      LOG_LEVEL: value,
      NODE_ENV: value,
      DATABASE_URL: value,
      REDIS_URL: value,
    });
    expect(message).not.toContain(value);
  });

  describe('HTTP and rate limit variables', () => {
    it('converts valid values', () => {
      expect(
        validateEnv({
          ...VALID,
          API_DOCS_ENABLED: 'true',
          CORS_ORIGINS: ' https://app.example.com, http://localhost:3001 ',
          TRUST_PROXY_HOPS: '1',
          REQUEST_BODY_LIMIT_KB: '256',
          RATE_LIMIT_WINDOW_MS: '10000',
          RATE_LIMIT_MAX_REQUESTS: '50',
        }),
      ).toMatchObject({
        API_DOCS_ENABLED: true,
        CORS_ORIGINS: ['https://app.example.com', 'http://localhost:3001'],
        TRUST_PROXY_HOPS: 1,
        REQUEST_BODY_LIMIT_KB: 256,
        RATE_LIMIT_WINDOW_MS: 10_000,
        RATE_LIMIT_MAX_REQUESTS: 50,
      });
    });

    it('reads API_DOCS_ENABLED=false as false', () => {
      expect(
        validateEnv({ ...VALID, API_DOCS_ENABLED: 'false' }).API_DOCS_ENABLED,
      ).toBe(false);
    });

    it.each(['yes', '1', 'TRUE', ''])(
      'rejects API_DOCS_ENABLED=%p',
      (value) => {
        expect(problemsOf({ ...VALID, API_DOCS_ENABLED: value })).toEqual([
          'API_DOCS_ENABLED: expected true or false',
        ]);
      },
    );

    it.each([
      ['a path', 'https://app.example.com/path'],
      ['a trailing slash', 'https://app.example.com/'],
      ['no scheme', 'app.example.com'],
      ['another scheme', 'ftp://app.example.com'],
      ['a wildcard subdomain', 'https://*.example.com'],
    ])('rejects a CORS origin with %s', (_label, origin) => {
      const problems = problemsOf({
        ...VALID,
        CORS_ORIGINS: `https://ok.example.com,${origin}`,
      });
      expect(problems).toHaveLength(1);
      expect(problems[0]).toMatch(/^CORS_ORIGINS: expected a comma-separated/);
    });

    it('accepts a wildcard CORS origin outside production', () => {
      expect(
        validateEnv({ ...VALID, NODE_ENV: 'development', CORS_ORIGINS: '*' })
          .CORS_ORIGINS,
      ).toEqual(['*']);
    });

    it('rejects a wildcard CORS origin in production, with a clean message', () => {
      expect(
        messageOf({
          ...VALID,
          NODE_ENV: 'production',
          TRUST_PROXY_HOPS: '1',
          QUEUE_WORKERS_ENABLED: 'false',
          CORS_ORIGINS: '*',
        }),
      ).toBe(
        'Invalid environment configuration:\n' +
          '  - CORS_ORIGINS: a wildcard (*) is not allowed when NODE_ENV is production: list each allowed origin',
      );
    });

    it('requires TRUST_PROXY_HOPS in production, with no default', () => {
      const production = {
        ...VALID,
        NODE_ENV: 'production',
        QUEUE_WORKERS_ENABLED: 'false',
      };
      expect(problemsOf(production)).toEqual([
        'TRUST_PROXY_HOPS: required when NODE_ENV is production: the number of proxies (load balancers) in front of the API, usually 1',
      ]);
      expect(problemsOf({ ...production, TRUST_PROXY_HOPS: '' })).toHaveLength(
        1,
      );
      expect(
        validateEnv({ ...production, TRUST_PROXY_HOPS: '0' }).TRUST_PROXY_HOPS,
      ).toBe(0);
    });

    it('requires QUEUE_WORKERS_ENABLED in production, with no default', () => {
      const production = {
        ...VALID,
        NODE_ENV: 'production',
        TRUST_PROXY_HOPS: '1',
      };
      expect(problemsOf(production)).toEqual([
        'QUEUE_WORKERS_ENABLED: required when NODE_ENV is production: true for a worker process, false for an API process',
      ]);
      expect(
        problemsOf({ ...production, QUEUE_WORKERS_ENABLED: '' }),
      ).toHaveLength(1);
      expect(
        validateEnv({ ...production, QUEUE_WORKERS_ENABLED: 'false' })
          .QUEUE_WORKERS_ENABLED,
      ).toBe(false);
      expect(
        validateEnv({ ...production, QUEUE_WORKERS_ENABLED: 'true' })
          .QUEUE_WORKERS_ENABLED,
      ).toBe(true);
    });

    it('defaults QUEUE_WORKERS_ENABLED to true outside production', () => {
      expect(
        validateEnv({ ...VALID, NODE_ENV: 'development' })
          .QUEUE_WORKERS_ENABLED,
      ).toBe(true);
      expect(
        validateEnv({ ...VALID, NODE_ENV: 'test' }).QUEUE_WORKERS_ENABLED,
      ).toBe(true);
      expect(
        validateEnv({ ...VALID, QUEUE_WORKERS_ENABLED: 'false' })
          .QUEUE_WORKERS_ENABLED,
      ).toBe(false);
    });

    it.each(['', 'Jazla', 'jazla:e2e', 'jazla-', '-jazla', 'a--b', 'a{b}'])(
      'rejects REDIS_KEY_PREFIX %p',
      (value) => {
        expect(problemsOf({ ...VALID, REDIS_KEY_PREFIX: value })).toEqual([
          'REDIS_KEY_PREFIX: expected lowercase letters and digits in words joined by single hyphens (jazla)',
        ]);
      },
    );

    it('accepts a REDIS_KEY_PREFIX of hyphen-joined words', () => {
      expect(
        validateEnv({ ...VALID, REDIS_KEY_PREFIX: 'jazla-e2e-m3x9k2' })
          .REDIS_KEY_PREFIX,
      ).toBe('jazla-e2e-m3x9k2');
    });

    it('rejects a QUEUE_WORKERS_ENABLED other than true or false', () => {
      expect(problemsOf({ ...VALID, QUEUE_WORKERS_ENABLED: 'yes' })).toEqual([
        'QUEUE_WORKERS_ENABLED: expected true or false',
      ]);
    });

    it('defaults TRUST_PROXY_HOPS to 0 outside production', () => {
      expect(
        validateEnv({ ...VALID, NODE_ENV: 'development' }).TRUST_PROXY_HOPS,
      ).toBe(0);
      expect(validateEnv({ ...VALID, NODE_ENV: 'test' }).TRUST_PROXY_HOPS).toBe(
        0,
      );
    });

    it.each([
      ['TRUST_PROXY_HOPS', '-1'],
      ['TRUST_PROXY_HOPS', '11'],
      ['REQUEST_BODY_LIMIT_KB', '0'],
      ['RATE_LIMIT_WINDOW_MS', '999'],
      ['RATE_LIMIT_MAX_REQUESTS', '0'],
      ['RATE_LIMIT_MAX_REQUESTS', 'many'],
      ['RATE_LIMIT_PRE_ROUTING_MAX_REQUESTS', '0'],
      // Above a typical 30 s orchestrator grace period: refused.
      ['SHUTDOWN_DEADLINE_MS', '30000'],
      ['SHUTDOWN_DEADLINE_MS', '999'],
    ])('rejects %s=%p', (name, value) => {
      const problems = problemsOf({ ...VALID, [name]: value });
      expect(problems).toHaveLength(1);
      expect(problems[0]).toMatch(
        new RegExp(`^${name}: expected an integer from`),
      );
    });
  });

  describe('storage and media variables', () => {
    it('converts valid values', () => {
      expect(
        validateEnv({
          ...VALID,
          STORAGE_ENDPOINT: 'http://localhost:9002',
          STORAGE_FORCE_PATH_STYLE: 'true',
          STORAGE_UPLOAD_URL_EXPIRY_SECONDS: '120',
          STORAGE_DOWNLOAD_URL_EXPIRY_SECONDS: '600',
          MEDIA_PENDING_UPLOAD_TTL_SECONDS: '7200',
          MEDIA_CLEANUP_INTERVAL_SECONDS: '60',
        }),
      ).toMatchObject({
        STORAGE_ENDPOINT: 'http://localhost:9002',
        STORAGE_FORCE_PATH_STYLE: true,
        STORAGE_UPLOAD_URL_EXPIRY_SECONDS: 120,
        STORAGE_DOWNLOAD_URL_EXPIRY_SECONDS: 600,
        MEDIA_PENDING_UPLOAD_TTL_SECONDS: 7_200,
        MEDIA_CLEANUP_INTERVAL_SECONDS: 60,
      });
    });

    it('reads an empty STORAGE_ENDPOINT as unset', () => {
      expect(
        validateEnv({ ...VALID, STORAGE_ENDPOINT: '' }).STORAGE_ENDPOINT,
      ).toBeUndefined();
    });

    it.each([
      'STORAGE_REGION',
      'STORAGE_ACCESS_KEY_ID',
      'STORAGE_SECRET_ACCESS_KEY',
      'STORAGE_PUBLIC_BUCKET',
      'STORAGE_PRIVATE_BUCKET',
      'STORAGE_PUBLIC_BASE_URL',
    ])('requires %s, with no default', (name) => {
      const problems = problemsOf({ ...VALID, [name]: undefined });
      expect(problems).toHaveLength(1);
      expect(problems[0]).toMatch(new RegExp(`^${name}: required`));
    });

    it.each(['', 'S3', 'gcs'])('rejects STORAGE_PROVIDER=%p', (value) => {
      expect(problemsOf({ ...VALID, STORAGE_PROVIDER: value })).toEqual([
        'STORAGE_PROVIDER: expected one of s3',
      ]);
    });

    it.each([
      ['uppercase letters', 'Jazla-Public'],
      ['too short', 'ab'],
      ['an underscore', 'jazla_public'],
      ['a leading hyphen', '-jazla'],
      ['two adjacent dots', 'jazla..public'],
      ['an IP address shape', '192.168.1.1'],
    ])('rejects a bucket name with %s', (_label, bucket) => {
      const problems = problemsOf({ ...VALID, STORAGE_PUBLIC_BUCKET: bucket });
      expect(problems).toHaveLength(1);
      expect(problems[0]).toMatch(
        /^STORAGE_PUBLIC_BUCKET: expected a bucket name/,
      );
    });

    it('refuses one bucket for both visibilities', () => {
      expect(
        problemsOf({ ...VALID, STORAGE_PRIVATE_BUCKET: 'example-public' }),
      ).toEqual([
        'STORAGE_PRIVATE_BUCKET: must differ from STORAGE_PUBLIC_BUCKET: public and private objects are kept in separate buckets',
      ]);
    });

    it.each([
      ['a trailing slash', 'https://cdn.example.com/media/'],
      ['a query', 'https://cdn.example.com/media?sig=secret-pass-3'],
      ['credentials', 'https://user:secret-pass-3@cdn.example.com'],
      ['another scheme', 'ftp://cdn.example.com'],
      ['no scheme', 'cdn.example.com'],
    ])(
      'rejects a STORAGE_PUBLIC_BASE_URL with %s without printing it',
      (_label, url) => {
        const problems = problemsOf({ ...VALID, STORAGE_PUBLIC_BASE_URL: url });
        expect(problems).toHaveLength(1);
        expect(problems[0]).toMatch(
          /^STORAGE_PUBLIC_BASE_URL: expected an http/,
        );
        expect(
          messageOf({ ...VALID, STORAGE_PUBLIC_BASE_URL: url }),
        ).not.toContain('secret-pass-3');
      },
    );

    it('rejects a STORAGE_ENDPOINT with a path ending in a slash', () => {
      expect(
        problemsOf({ ...VALID, STORAGE_ENDPOINT: 'http://localhost:9002/' })[0],
      ).toMatch(/^STORAGE_ENDPOINT: expected an http/);
    });

    it('never repeats a credential in the message', () => {
      const message = messageOf({
        ...VALID,
        STORAGE_ACCESS_KEY_ID: 'leaked-key-1',
        STORAGE_SECRET_ACCESS_KEY: 'leaked-secret-1',
        STORAGE_REGION: 'NOT A REGION',
      });
      expect(message).not.toContain('leaked-key-1');
      expect(message).not.toContain('leaked-secret-1');
    });

    it('requires the pending upload time to outlast the upload URL', () => {
      expect(
        problemsOf({
          ...VALID,
          STORAGE_UPLOAD_URL_EXPIRY_SECONDS: '600',
          MEDIA_PENDING_UPLOAD_TTL_SECONDS: '600',
        }),
      ).toEqual([
        'MEDIA_PENDING_UPLOAD_TTL_SECONDS: must be greater than STORAGE_UPLOAD_URL_EXPIRY_SECONDS, so an upload is never removed while its upload URL is still valid',
      ]);
    });

    // The other value of each pair keeps the pending time above the upload expiry, so
    // only the range is reported.
    it.each([
      ['STORAGE_UPLOAD_URL_EXPIRY_SECONDS', '59', {}],
      [
        'STORAGE_UPLOAD_URL_EXPIRY_SECONDS',
        '3601',
        { MEDIA_PENDING_UPLOAD_TTL_SECONDS: '7200' },
      ],
      ['STORAGE_DOWNLOAD_URL_EXPIRY_SECONDS', '86401', {}],
      [
        'MEDIA_PENDING_UPLOAD_TTL_SECONDS',
        '299',
        { STORAGE_UPLOAD_URL_EXPIRY_SECONDS: '60' },
      ],
      ['MEDIA_CLEANUP_INTERVAL_SECONDS', '59', {}],
    ])('rejects %s=%p', (name, value, others) => {
      const problems = problemsOf({ ...VALID, ...others, [name]: value });
      expect(problems).toHaveLength(1);
      expect(problems[0]).toMatch(
        new RegExp(`^${name}: expected an integer from`),
      );
    });
  });

  describe('auth variables', () => {
    it('requires both secrets in production, without printing anything', () => {
      expect(
        problemsOf({
          ...WITHOUT_AUTH_SECRETS,
          NODE_ENV: 'production',
          TRUST_PROXY_HOPS: '1',
          QUEUE_WORKERS_ENABLED: 'false',
        }),
      ).toEqual([
        'AUTH_ACCESS_TOKEN_SECRET: required when NODE_ENV is production: expected a secret of at least 32 characters (for example the output of: openssl rand -base64 48)',
        'AUTH_OTP_SECRET: required when NODE_ENV is production: expected a secret of at least 32 characters (for example the output of: openssl rand -base64 48)',
      ]);
    });

    it('requires the IBAN key in production, without printing anything', () => {
      expect(
        problemsOf({ ...PRODUCTION, VENDORS_IBAN_KEY: undefined }),
      ).toEqual([
        'VENDORS_IBAN_KEY: required when NODE_ENV is production: expected 32 random bytes in base64 (for example the output of: openssl rand -base64 32)',
      ]);
    });

    it.each([
      ['not base64', 'not base64 at all, not even close!!!!!!!!!!=='],
      ['16 bytes', 'ZXhhbXBsZS0xNi1ieXRlcw=='],
      ['33 bytes', 'ZXhhbXBsZS1pYmFuLWtleS1ub3QtYS1yZWFsLWtleSEh'],
    ])('refuses an IBAN key that is %s', (_label, key) => {
      expect(problemsOf({ ...VALID, VENDORS_IBAN_KEY: key })).toEqual([
        'VENDORS_IBAN_KEY: expected 32 random bytes in base64 (for example the output of: openssl rand -base64 32)',
      ]);
    });

    it('makes a random IBAN key of 32 bytes when unset outside production', () => {
      const withoutKey = { ...VALID, VENDORS_IBAN_KEY: undefined };
      const first = validateEnv(withoutKey);
      const second = validateEnv(withoutKey);

      expect(Buffer.from(first.VENDORS_IBAN_KEY, 'base64')).toHaveLength(32);
      expect(second.VENDORS_IBAN_KEY).not.toBe(first.VENDORS_IBAN_KEY);
    });

    it('makes a random secret of its own for each when unset outside production', () => {
      const first = validateEnv(WITHOUT_AUTH_SECRETS);
      const second = validateEnv({
        ...WITHOUT_AUTH_SECRETS,
        AUTH_ACCESS_TOKEN_SECRET: '',
      });

      expect(first.AUTH_ACCESS_TOKEN_SECRET.length).toBeGreaterThanOrEqual(32);
      expect(first.AUTH_OTP_SECRET.length).toBeGreaterThanOrEqual(32);
      expect(first.AUTH_OTP_SECRET).not.toBe(first.AUTH_ACCESS_TOKEN_SECRET);
      expect(second.AUTH_ACCESS_TOKEN_SECRET).not.toBe(
        first.AUTH_ACCESS_TOKEN_SECRET,
      );
    });

    it('refuses a short secret, never repeating it', () => {
      const message = messageOf({ ...VALID, AUTH_OTP_SECRET: 'too-short' });

      expect(message).toContain(
        'AUTH_OTP_SECRET: expected a secret of at least 32 characters',
      );
      expect(message).not.toContain('too-short');
    });

    it('refuses one secret used for both purposes', () => {
      expect(
        problemsOf({
          ...VALID,
          AUTH_OTP_SECRET: AUTH_SECRETS.AUTH_ACCESS_TOKEN_SECRET,
        }),
      ).toEqual([
        'AUTH_OTP_SECRET: must differ from AUTH_ACCESS_TOKEN_SECRET: one secret signs tokens, the other hashes verification codes',
      ]);
    });

    it('accepts a previous signing key with an id of its own', () => {
      const env = validateEnv({
        ...VALID,
        AUTH_ACCESS_TOKEN_KEY_ID: '2',
        AUTH_ACCESS_TOKEN_PREVIOUS_SECRET:
          'example-previous-secret-0123456789abcdef',
        AUTH_ACCESS_TOKEN_PREVIOUS_KEY_ID: '1',
      });

      expect(env.AUTH_ACCESS_TOKEN_KEY_ID).toBe('2');
      expect(env.AUTH_ACCESS_TOKEN_PREVIOUS_KEY_ID).toBe('1');
    });

    it('refuses a previous secret without its id, and an id without its secret', () => {
      const expected = [
        'AUTH_ACCESS_TOKEN_PREVIOUS_SECRET: AUTH_ACCESS_TOKEN_PREVIOUS_SECRET and AUTH_ACCESS_TOKEN_PREVIOUS_KEY_ID are set together or not at all',
      ];
      expect(
        problemsOf({
          ...VALID,
          AUTH_ACCESS_TOKEN_PREVIOUS_SECRET:
            'example-previous-secret-0123456789abcdef',
        }),
      ).toEqual(expected);
      expect(
        problemsOf({ ...VALID, AUTH_ACCESS_TOKEN_PREVIOUS_KEY_ID: '0' }),
      ).toEqual(expected);
    });

    it('refuses a previous key with the id of the current one', () => {
      expect(
        problemsOf({
          ...VALID,
          AUTH_ACCESS_TOKEN_PREVIOUS_SECRET:
            'example-previous-secret-0123456789abcdef',
          AUTH_ACCESS_TOKEN_PREVIOUS_KEY_ID: '1',
        }),
      ).toEqual([
        'AUTH_ACCESS_TOKEN_PREVIOUS_KEY_ID: must differ from AUTH_ACCESS_TOKEN_KEY_ID: a rotation gives the new key a new id',
      ]);
    });

    it('reads review accounts, normalising their phones', () => {
      expect(
        validateEnv({ ...VALID, AUTH_REVIEW_ACCOUNTS: '0512345678:123456' })
          .AUTH_REVIEW_ACCOUNTS,
      ).toEqual([{ phone: '+966512345678', code: '123456' }]);
    });

    it('refuses a malformed review account without repeating it', () => {
      const message = messageOf({
        ...VALID,
        AUTH_REVIEW_ACCOUNTS: '0512345678-123456',
      });

      expect(message).toContain(
        'AUTH_REVIEW_ACCOUNTS: expected a comma-separated list of phone:code pairs',
      );
      expect(message).not.toContain('123456');
    });

    it('refuses a review code of another length than AUTH_OTP_LENGTH', () => {
      expect(
        problemsOf({ ...VALID, AUTH_REVIEW_ACCOUNTS: '0512345678:1234' }),
      ).toEqual([
        'AUTH_REVIEW_ACCOUNTS: every review code must have AUTH_OTP_LENGTH digits',
      ]);
    });

    it.each([
      ['AUTH_OTP_MAX_ATTEMPTS', '0', 'expected an integer from 1 to 10'],
      ['AUTH_OTP_LENGTH', '3', 'expected an integer from 4 to 8'],
      ['AUTH_OTP_PHONE_LIMIT', 'many', 'expected an integer from 1 to 100'],
      [
        'AUTH_ACCESS_TOKEN_TTL_SECONDS',
        '7200',
        'expected an integer from 60 to 3600',
      ],
    ])('refuses %s=%s', (variable, value, expected) => {
      expect(problemsOf({ ...VALID, [variable]: value })).toEqual([
        `${variable}: ${expected}`,
      ]);
    });

    it('starts in production with both secrets set', () => {
      expect(validateEnv(PRODUCTION).AUTH_OTP_TTL_SECONDS).toBe(300);
    });
  });

  describe('sms variables', () => {
    it('reads an ordered, comma-separated provider list', () => {
      expect(
        validateEnv({ ...VALID, SMS_PROVIDERS: ' log ' }).SMS_PROVIDERS,
      ).toEqual(['log']);
    });

    it('defaults to the log provider outside production, and to none in production', () => {
      expect(validateEnv(VALID).SMS_PROVIDERS).toEqual(['log']);
      expect(
        validateEnv({ ...VALID, SMS_PROVIDERS: '' }).SMS_PROVIDERS,
      ).toEqual(['log']);
      expect(
        validateEnv({
          ...VALID,
          NODE_ENV: 'production',
          TRUST_PROXY_HOPS: '1',
          QUEUE_WORKERS_ENABLED: 'false',
        }).SMS_PROVIDERS,
      ).toEqual([]);
    });

    it('refuses an unknown provider at startup', () => {
      expect(
        problemsOf({ ...VALID, SMS_PROVIDERS: 'log,carrier-pigeon' }),
      ).toEqual(['SMS_PROVIDERS.1: expected a comma-separated list of: log']);
    });

    it('refuses a provider listed twice', () => {
      expect(problemsOf({ ...VALID, SMS_PROVIDERS: 'log,log' })).toEqual([
        'SMS_PROVIDERS: a provider is listed more than once',
      ]);
    });

    it('refuses a listed provider missing one of its variables, naming it (review of #232)', () => {
      // Today no provider needs a variable, so the check runs only with a provider that
      // does: a fresh module registry where `log` needs one. The variable must be one
      // the schema declares (it reads the parsed environment, as a real provider's
      // would be): STORAGE_ENDPOINT, optional and unset in VALID. Loaded with require:
      // a dynamic import loads outside Jest's registry, and requireActual skips the mock.
      jest.isolateModules(() => {
        jest.doMock('./sms-provider-variables.constants', () => ({
          SMS_PROVIDER_VARIABLES: { log: ['STORAGE_ENDPOINT'] },
        }));
        type ValidateEnvModule = typeof import('./validate-env');
        // eslint-disable-next-line @typescript-eslint/no-require-imports -- the only load that sees jest.doMock in an isolated registry
        const isolated = require('./validate-env') as ValidateEnvModule;

        expect(() =>
          isolated.validateEnv({ ...VALID, SMS_PROVIDERS: 'log' }),
        ).toThrow('STORAGE_ENDPOINT: required when SMS_PROVIDERS lists log');
        expect(
          isolated.validateEnv({
            ...VALID,
            SMS_PROVIDERS: 'log',
            STORAGE_ENDPOINT: 'http://localhost:9002',
          }).SMS_PROVIDERS,
        ).toEqual(['log']);
      });
    });

    it('refuses the log provider in production', () => {
      expect(
        problemsOf({
          ...VALID,
          NODE_ENV: 'production',
          TRUST_PROXY_HOPS: '1',
          QUEUE_WORKERS_ENABLED: 'false',
          SMS_PROVIDERS: 'log',
        }),
      ).toEqual([
        'SMS_PROVIDERS: the log provider writes message text (OTP codes) to the log: not allowed when NODE_ENV is production',
      ]);
    });

    it.each(['499', '30001', '1.5'])(
      'rejects SMS_PROVIDER_TIMEOUT_MS %p',
      (value) => {
        expect(
          problemsOf({ ...VALID, SMS_PROVIDER_TIMEOUT_MS: value }),
        ).toEqual([
          'SMS_PROVIDER_TIMEOUT_MS: expected an integer from 500 to 30000',
        ]);
      },
    );
  });
});

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
const VALID = { DATABASE_URL, REDIS_URL, ...STORAGE };
/** The defaults of the HTTP and rate limit variables. */
const HTTP_DEFAULTS = {
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
});

// `pnpm test:e2e`: runs the e2e tests against the test database and a test Redis database.
//
// 1. Reads DATABASE_URL and REDIS_URL (from the environment, or `.env`) and derives the
//    test targets from them, so development data is never touched:
//    - PostgreSQL: same server, database name + `_test` (`jazla` -> `jazla_test`, created
//      by docker-compose.yml).
//    - Redis: same server, the next logical database (`/0` -> `/1`). The queue tests
//      remove their own queues when they finish.
//    - Object storage: same server, the buckets + `-test` (`jazla-public` ->
//      `jazla-public-test`, created by docker-compose.yml), and STORAGE_PUBLIC_BASE_URL
//      moved to the test public bucket. Storage is not checked here: the suites that
//      use MinIO say so themselves when it is down, and the others run without it.
// 2. Fails fast, with one line, when either server does not answer.
// 3. Applies the migrations to the test database (`prisma migrate deploy`).
// 4. Runs Jest with both URLs pointing at the test targets and no queue workers unless
//    a suite turns one on. Extra arguments go to both phases. Most suites run in parallel;
//    the suites that write the shared operations settings row run serially after those
//    suites, so settings writes cannot race with another suite's reads:
//    - Each test sends its own client address (X-Forwarded-For, set by createHttpApp;
//      TRUST_PROXY_HOPS=1 here), so no test shares a rate limit counter with another.
//    - Each run has its own Redis key prefix (REDIS_KEY_PREFIX=jazla-e2e-<run id>), for
//      rate limit and queue keys, so a run never sees a previous run's keys.
// 5. Deletes the run's Redis keys when Jest ends, passed or failed.
import { spawnSync } from 'node:child_process';
import { createConnection } from 'node:net';
import { join } from 'node:path';
import { randomBytes } from 'node:crypto';
import { config } from 'dotenv';
import { Redis } from 'ioredis';

const ROOT = join(import.meta.dirname, '..');
const CONNECT_TIMEOUT_MS = 2_000;
const REDIS_DATABASES = 16;

config({ path: join(ROOT, '.env'), quiet: true });

function fail(line) {
  console.error(line);
  process.exit(1);
}

/** Parses a URL from the environment; the message never repeats the value. */
function parseUrl(name, value) {
  if (!value) {
    fail(`e2e: ${name} is not set. Copy .env.example to .env, then run \`pnpm infra:up\`.`);
  }
  try {
    return new URL(value);
  } catch {
    fail(`e2e: ${name} is not a valid URL. Fix it in .env (see .env.example).`);
  }
}

function testDatabaseUrl(value) {
  const url = parseUrl('DATABASE_URL', value);
  url.pathname = `${url.pathname.replace(/^\//, '')}_test`;
  return url;
}

function testRedisUrl(value) {
  const url = parseUrl('REDIS_URL', value);
  const database = Number(url.pathname.replace(/^\//, '') || '0');
  if (!Number.isInteger(database) || database + 1 >= REDIS_DATABASES) {
    fail('e2e: REDIS_URL must name a logical database from 0 to 14, so the tests can use the next one.');
  }
  url.pathname = `/${database + 1}`;
  return url;
}

function isReachable(host, port) {
  return new Promise((resolve) => {
    const socket = createConnection({ host, port });
    const done = (result) => {
      socket.destroy();
      resolve(result);
    };
    socket.setTimeout(CONNECT_TIMEOUT_MS, () => done(false));
    socket.once('connect', () => done(true));
    socket.once('error', () => done(false));
  });
}

/** The storage variables pointed at the -test buckets; the message never repeats a value. */
function testStorage(env) {
  const publicBucket = env.STORAGE_PUBLIC_BUCKET;
  const privateBucket = env.STORAGE_PRIVATE_BUCKET;
  const baseUrl = env.STORAGE_PUBLIC_BASE_URL;
  if (!publicBucket || !privateBucket || !baseUrl) {
    fail('e2e: the STORAGE_* variables are not set. Copy them from .env.example to .env, then run `pnpm infra:up`.');
  }
  if (!baseUrl.endsWith(`/${publicBucket}`)) {
    fail('e2e: STORAGE_PUBLIC_BASE_URL must end with /<STORAGE_PUBLIC_BUCKET> (as in .env.example), so the tests can read the test bucket.');
  }
  return {
    STORAGE_PUBLIC_BUCKET: `${publicBucket}-test`,
    STORAGE_PRIVATE_BUCKET: `${privateBucket}-test`,
    STORAGE_PUBLIC_BASE_URL: `${baseUrl}-test`,
  };
}

const databaseUrl = testDatabaseUrl(process.env.DATABASE_URL);
const storage = testStorage(process.env);
const redisUrl = testRedisUrl(process.env.REDIS_URL);
const databasePort = Number(databaseUrl.port || 5432);
const redisPort = Number(redisUrl.port || 6379);

const [databaseUp, redisUp] = await Promise.all([
  isReachable(databaseUrl.hostname, databasePort),
  isReachable(redisUrl.hostname, redisPort),
]);
if (!databaseUp) {
  fail(`e2e: the database at ${databaseUrl.hostname}:${databasePort} is not running. Run \`pnpm infra:up\`, then run the e2e tests again.`);
}
if (!redisUp) {
  fail(`e2e: Redis at ${redisUrl.hostname}:${redisPort} is not running. Run \`pnpm infra:up\`, then run the e2e tests again.`);
}

/** This run's Redis key prefix: a REDIS_KEY_PREFIX of hyphen-joined lowercase words. */
const keyPrefix = `jazla-e2e-${Date.now().toString(36)}${randomBytes(3).toString('hex')}`;

const env = {
  ...process.env,
  DATABASE_URL: databaseUrl.toString(),
  REDIS_URL: redisUrl.toString(),
  ...storage,
  NODE_ENV: 'test',
  REDIS_KEY_PREFIX: keyPrefix,
  // createHttpApp sends each test's own address as X-Forwarded-For, as one load
  // balancer would; a test about the socket address sets TRUST_PROXY_HOPS=0 itself.
  TRUST_PROXY_HOPS: '1',
  // A high default limit, so a suite that sends many requests in one test is never
  // limited. The rate limit suite sets its own small limits.
  RATE_LIMIT_MAX_REQUESTS: '1000000',
  RATE_LIMIT_PRE_ROUTING_MAX_REQUESTS: '1000000',
  // Apps start with no queue workers: the suites share the queues, so a worker would
  // take another suite's jobs. A suite that needs one turns on only that worker
  // (`workers` in test/support/create-http-app.ts and create-queue-probe-app.ts).
  QUEUE_WORKERS_ENABLED: 'false',
};

const migrate = spawnSync(
  process.execPath,
  [join(ROOT, 'node_modules', 'prisma', 'build', 'index.js'), 'migrate', 'deploy'],
  { cwd: ROOT, env, encoding: 'utf8' },
);
if (migrate.status !== 0) {
  process.stderr.write(migrate.stdout + migrate.stderr);
  fail(`e2e: applying migrations to the test database "${databaseUrl.pathname.slice(1)}" failed (output above).`);
}

function runJest(configPath, options = []) {
  return spawnSync(
    process.execPath,
    [
      '--experimental-vm-modules',
      join(ROOT, 'node_modules', 'jest', 'bin', 'jest.js'),
      '--config',
      configPath,
      ...options,
      ...process.argv.slice(2),
    ],
    { cwd: ROOT, env, stdio: 'inherit' },
  );
}

const parallelSuites = runJest('./test/jest-e2e.json');
let e2eStatus = parallelSuites.status ?? 1;
if (e2eStatus === 0) {
  const settingsSuites = runJest('./test/jest-e2e-settings.json', [
    '--runInBand',
  ]);
  e2eStatus = settingsSuites.status ?? 1;
}

/** Deletes every key of this run (rate limit counters, queues) from the test Redis database. */
async function deleteRunKeys() {
  const redis = new Redis(redisUrl.toString(), { lazyConnect: true, maxRetriesPerRequest: 1 });
  let deleted = 0;
  try {
    await redis.connect();
    let cursor = '0';
    do {
      const [next, keys] = await redis.scan(cursor, 'MATCH', `${keyPrefix}:*`, 'COUNT', 1000);
      if (keys.length > 0) {
        deleted += await redis.del(...keys);
      }
      cursor = next;
    } while (cursor !== '0');
    console.log(`e2e: deleted ${deleted} Redis keys of run ${keyPrefix}.`);
  } catch {
    console.error(`e2e: could not delete the Redis keys of run ${keyPrefix} (prefix ${keyPrefix}:); the next run uses another prefix.`);
  } finally {
    redis.disconnect();
  }
}

await deleteRunKeys();
process.exit(e2eStatus);

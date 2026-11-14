import { once } from 'node:events';
import { performance } from 'node:perf_hooks';
import { Logger } from '@nestjs/common';
import type { NestExpressApplication } from '@nestjs/platform-express';
import request from 'supertest';
import { ERROR_MESSAGES } from '@common/errors/error-messages.constants';
import type { ErrorResponseBody } from '@common/filters/error-response-body.interface';
import { buildHttpConfig } from '@config/build-http-config';
import { loadEnv } from '@config/load-env';
import { rateLimitKeys } from '@infra/rate-limit/rate-limit-keys';
import { RedisThrottlerStorage } from '@infra/rate-limit/redis-throttler-storage';
import { RedisService } from '@infra/redis/redis.service';
import { clearRateLimits } from './support/clear-rate-limits';
import { createHttpApp } from './support/create-http-app';
import type { HttpAppOptions } from './support/http-app-options.type';
import { RateLimitProbeController } from './support/rate-limit-probe.controller';
import {
  PROBE_DEFAULT_LIMIT,
  SHARED_PROBE_LIMIT,
  STRICT_PROBE_LIMIT,
} from './support/rate-limit-probe.constants';
import { startTcpProxy } from './support/tcp-proxy';

const DEFAULT_URL = '/v1/rate-limit-probe/default';
const OTHER_URL = '/v1/rate-limit-probe/other';
const STRICT_URL = '/v1/rate-limit-probe/strict';
const FAIL_CLOSED_URL = '/v1/rate-limit-probe/fail-closed';

/** The shared Redis client class, with its production options, at `url`. */
function productionRedisClient(url: string): RedisService {
  return new RedisService({ url });
}

/** The test Redis URL with another host and port. */
function redisUrlAt(port: number): string {
  const url = new URL(loadEnv().REDIS_URL);
  url.hostname = '127.0.0.1';
  url.port = String(port);
  return url.toString();
}

/** Sends one GET and returns its status and how long it took, in ms. */
async function timed(app: NestExpressApplication, url: string) {
  const started = performance.now();
  const res = await request(app.getHttpServer()).get(url);
  return {
    status: res.status,
    body: res.body as ErrorResponseBody,
    ms: performance.now() - started,
  };
}

/** Sends `count` GET requests one after the other and returns their statuses. */
async function statuses(
  app: NestExpressApplication,
  url: string,
  count: number,
  headers: Record<string, string> = {},
): Promise<number[]> {
  const result: number[] = [];
  for (let i = 0; i < count; i += 1) {
    const res = await request(app.getHttpServer()).get(url).set(headers);
    result.push(res.status);
  }
  return result;
}

const times = (count: number, status: number): number[] =>
  Array.from({ length: count }, () => status);

describe('Rate limiting (e2e)', () => {
  const apps: NestExpressApplication[] = [];

  /** The application with the probe controller and a default limit of 5 a minute. */
  async function start(
    options: HttpAppOptions = {},
  ): Promise<NestExpressApplication> {
    const app = await createHttpApp({
      controllers: [RateLimitProbeController],
      rateLimit: PROBE_DEFAULT_LIMIT,
      ...options,
    });
    apps.push(app);
    return app;
  }

  beforeEach(async () => {
    const app = await start();
    await clearRateLimits(app.get(RedisService));
  });

  afterEach(async () => {
    await clearRateLimits(apps[0].get(RedisService));
    await Promise.all(apps.splice(0).map((app) => app.close()));
  });

  it('over the default limit: 429 RATE_LIMITED in the standard shape, with Retry-After', async () => {
    const [app] = apps;
    expect(
      await statuses(app, DEFAULT_URL, PROBE_DEFAULT_LIMIT.maxRequests),
    ).toEqual(times(PROBE_DEFAULT_LIMIT.maxRequests, 200));

    const res = await request(app.getHttpServer())
      .get(DEFAULT_URL)
      .set('Accept-Language', 'en')
      .expect(429);
    const body = res.body as ErrorResponseBody;
    expect(Object.keys(body).sort()).toEqual(['code', 'message', 'requestId']);
    expect(body.code).toBe('RATE_LIMITED');
    expect(body.message).toBe(ERROR_MESSAGES.RATE_LIMITED.en);
    const retryAfter = Number(res.headers['retry-after']);
    expect(Number.isInteger(retryAfter)).toBe(true);
    expect(retryAfter).toBeGreaterThan(0);
    expect(retryAfter).toBeLessThanOrEqual(60);
  });

  it('counts the default limit per client, across endpoints', async () => {
    const [app] = apps;
    await statuses(app, DEFAULT_URL, 3);
    expect(await statuses(app, OTHER_URL, 3)).toEqual([200, 200, 429]);
  });

  it('limits an endpoint with a stricter limit sooner, on its own counter', async () => {
    const [app] = apps;
    expect(
      await statuses(app, STRICT_URL, STRICT_PROBE_LIMIT.limit + 1),
    ).toEqual([200, 200, 429]);
    const res = await request(app.getHttpServer()).get(STRICT_URL).expect(429);
    expect((res.body as ErrorResponseBody).code).toBe('RATE_LIMITED');
    expect(res.headers['retry-after']).toBeDefined();
    // The strict endpoint did not use up the client's default counter.
    await request(app.getHttpServer()).get(DEFAULT_URL).expect(200);
  });

  it('never limits health, which carries no rate limit headers', async () => {
    const [app] = apps;
    const count = PROBE_DEFAULT_LIMIT.maxRequests * 3;
    expect(await statuses(app, '/v1/health', count)).toEqual(times(count, 200));
    const res = await request(app.getHttpServer())
      .get('/v1/health/ready')
      .expect(200);
    expect(res.headers['x-ratelimit-limit']).toBeUndefined();
    // Health requests did not count against the client's default limit.
    await request(app.getHttpServer()).get(DEFAULT_URL).expect(200);
  });

  it('shares limits between two instances using the same Redis', async () => {
    const [first] = apps;
    const second = await start();
    expect(await statuses(first, DEFAULT_URL, 3)).toEqual([200, 200, 200]);
    expect(await statuses(second, DEFAULT_URL, 2)).toEqual([200, 200]);
    await request(first.getHttpServer()).get(DEFAULT_URL).expect(429);
    await request(second.getHttpServer()).get(DEFAULT_URL).expect(429);
  });

  it('shares a counter between endpoints declaring the same name and settings', async () => {
    const [app] = apps;
    expect(
      await statuses(
        app,
        '/v1/rate-limit-probe/shared-a',
        SHARED_PROBE_LIMIT.limit,
      ),
    ).toEqual(times(SHARED_PROBE_LIMIT.limit, 200));
    await request(app.getHttpServer())
      .get('/v1/rate-limit-probe/shared-b')
      .expect(429);
  });

  it('a client cannot regain requests by waiting out a block inside the window', async () => {
    const [app] = apps;
    const storage = app.get(RedisThrottlerStorage);
    const key = 'e2e:block-reset:client:198.51.100.7';
    const count = () => storage.increment(key, 60_000, 2, 60_000);
    expect((await count()).isBlocked).toBe(false);
    expect((await count()).isBlocked).toBe(false);
    expect((await count()).isBlocked).toBe(true);
    // The block ends (its key expires) while the 60 s window is still running.
    await app.get(RedisService).del(rateLimitKeys(key).blocked);
    const after = await count();
    process.stdout.write(
      `after the block ended inside the window: totalHits=${after.totalHits} isBlocked=${after.isBlocked}\n`,
    );
    expect(after.isBlocked).toBe(true);
  });

  describe('when Redis is unavailable', () => {
    let warn: jest.SpyInstance;

    beforeEach(() => {
      warn = jest.spyOn(Logger.prototype, 'warn');
    });

    afterEach(() => {
      warn.mockRestore();
    });

    function outageWarnings(): number {
      return warn.mock.calls.filter(
        ([, message]) =>
          typeof message === 'string' &&
          message.startsWith('Rate limit storage unavailable'),
      ).length;
    }

    it('after Redis stops: fail-open requests pass at once, a fail-closed endpoint answers 503', async () => {
      // The production client class and options, connected through a proxy to the test
      // Redis; stopping the proxy is Redis stopping, as the client sees it.
      const proxy = await startTcpProxy(
        '127.0.0.1',
        Number(new URL(loadEnv().REDIS_URL).port),
      );
      const redis = productionRedisClient(redisUrlAt(proxy.port));
      try {
        if (redis.status !== 'ready') {
          await once(redis, 'ready');
        }
        const app = await start({ rateLimitRedis: redis });
        expect((await timed(app, FAIL_CLOSED_URL)).status).toBe(200);

        await proxy.stop();
        const results: Awaited<ReturnType<typeof timed>>[] = [];
        for (let i = 0; i < 10; i += 1) {
          results.push(await timed(app, DEFAULT_URL));
        }
        process.stdout.write(
          `fail-open with Redis stopped (client status ${redis.status}): ${results
            .map((r) => `${r.status} in ${r.ms.toFixed(1)} ms`)
            .join(', ')}\n`,
        );
        expect(results.map((r) => r.status)).toEqual(times(10, 200));
        for (const result of results) {
          expect(result.ms).toBeLessThan(50);
        }

        const closed = await timed(app, FAIL_CLOSED_URL);
        process.stdout.write(
          `fail-closed with Redis stopped: ${closed.status} ${closed.body.code} in ${closed.ms.toFixed(1)} ms\n`,
        );
        expect(closed.status).toBe(503);
        expect(closed.body.code).toBe('SERVICE_UNAVAILABLE');
        expect(outageWarnings()).toBe(1);
      } finally {
        redis.disconnect();
        await proxy.stop();
      }
    });

    it('never connected (nothing listens): requests pass at once, fail-closed answers 503', async () => {
      // Nothing listens on port 1. The production client keeps trying to reconnect.
      const redis = productionRedisClient(redisUrlAt(1));
      try {
        const app = await start({ rateLimitRedis: redis });
        const count = PROBE_DEFAULT_LIMIT.maxRequests * 2;
        const results: Awaited<ReturnType<typeof timed>>[] = [];
        for (let i = 0; i < count; i += 1) {
          results.push(await timed(app, DEFAULT_URL));
        }
        expect(results.map((r) => r.status)).toEqual(times(count, 200));
        for (const result of results) {
          expect(result.ms).toBeLessThan(50);
        }
        expect((await timed(app, FAIL_CLOSED_URL)).body.code).toBe(
          'SERVICE_UNAVAILABLE',
        );
        expect(outageWarnings()).toBe(1);
      } finally {
        redis.disconnect();
      }
    });
  });

  describe('before routing', () => {
    it('limits requests to an unknown route', async () => {
      const [app] = apps;
      const result = await statuses(app, '/v1/does-not-exist', 12);
      process.stdout.write(
        `12 requests to an unknown route: ${result.join(', ')}\n`,
      );
      expect(result).toEqual([
        ...times(PROBE_DEFAULT_LIMIT.preRoutingMaxRequests, 404),
        429,
        429,
      ]);
      const res = await request(app.getHttpServer())
        .get('/wp-login.php')
        .expect(429);
      expect((res.body as ErrorResponseBody).code).toBe('RATE_LIMITED');
      expect(Number(res.headers['retry-after'])).toBeGreaterThan(0);
    });

    it('limits malformed requests, before their body is parsed', async () => {
      const [app] = apps;
      const result: number[] = [];
      for (let i = 0; i <= PROBE_DEFAULT_LIMIT.preRoutingMaxRequests; i += 1) {
        const res = await request(app.getHttpServer())
          .post('/v1/rate-limit-probe/default')
          .set('Content-Type', 'application/json')
          .send('{"broken": ');
        result.push(res.status);
      }
      expect(result).toEqual([
        ...times(PROBE_DEFAULT_LIMIT.preRoutingMaxRequests, 400),
        429,
      ]);
    });
  });

  describe('client address behind a proxy', () => {
    it('tells clients apart by X-Forwarded-For with TRUST_PROXY_HOPS=1', async () => {
      const app = await start({
        http: buildHttpConfig({ ...loadEnv(), TRUST_PROXY_HOPS: 1 }),
      });
      const first = { 'X-Forwarded-For': '203.0.113.10' };
      const second = { 'X-Forwarded-For': '203.0.113.20' };
      expect(
        await statuses(
          app,
          DEFAULT_URL,
          PROBE_DEFAULT_LIMIT.maxRequests + 1,
          first,
        ),
      ).toEqual([200, 200, 200, 200, 200, 429]);
      await request(app.getHttpServer())
        .get(DEFAULT_URL)
        .set(second)
        .expect(200);
    });

    it('ignores a forged X-Forwarded-For with TRUST_PROXY_HOPS=0', async () => {
      const [app] = apps;
      const results: number[] = [];
      for (let i = 0; i <= PROBE_DEFAULT_LIMIT.maxRequests; i += 1) {
        const res = await request(app.getHttpServer())
          .get(DEFAULT_URL)
          .set('X-Forwarded-For', `203.0.113.${i + 1}`);
        results.push(res.status);
      }
      expect(results).toEqual([200, 200, 200, 200, 200, 429]);
    });
  });
});

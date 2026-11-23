import type { NestExpressApplication } from '@nestjs/platform-express';
import request from 'supertest';
import { loadEnv } from '@config/load-env';
import { RedisReadinessCheck } from '@infra/redis/redis-readiness.check';
import { RedisService } from '@infra/redis/redis.service';
import { createHttpApp } from './support/create-http-app';

describe('Health (e2e)', () => {
  let app: NestExpressApplication;

  beforeEach(async () => {
    app = await createHttpApp();
  });

  afterEach(async () => {
    await app.close();
  });

  it('GET /v1/health returns 200 with status ok', () => {
    return request(app.getHttpServer())
      .get('/v1/health')
      .expect(200)
      .expect({ status: 'ok' });
  });

  it('GET /v1/health/ready returns 200 with the database and Redis up', () => {
    return request(app.getHttpServer())
      .get('/v1/health/ready')
      .expect(200)
      .expect({ status: 'ok', checks: { database: 'up', redis: 'up' } });
  });

  it('GET /v1/health/ready returns 503, draining, from the moment SIGTERM arrives', async () => {
    // What enableShutdownHooks reacts to; delivered to the listeners only, so this test
    // process keeps running.
    process.emit('SIGTERM');
    const res = await request(app.getHttpServer())
      .get('/v1/health/ready')
      .expect(503);
    expect(res.body).toEqual({
      status: 'unavailable',
      checks: { database: 'up', redis: 'up' },
      draining: true,
    });
    // Liveness is unaffected: the process still answers.
    await request(app.getHttpServer()).get('/v1/health').expect(200);
  });

  it('GET /api/v1/health returns 404', () => {
    return request(app.getHttpServer()).get('/api/v1/health').expect(404);
  });

  it('GET /health without the prefix returns 404', () => {
    return request(app.getHttpServer()).get('/health').expect(404);
  });
});

describe('Redis readiness on the configured database (e2e)', () => {
  it('reports Redis down when selecting the database failed at connection time', async () => {
    // Database 42 does not exist on a default server (16 databases). The schema refuses
    // it now; the client is built directly to reproduce a SELECT that fails at runtime.
    const url = new URL(loadEnv().REDIS_URL);
    url.pathname = '/42';
    const redis = new RedisService({ url: url.toString() });
    try {
      // ioredis emits `error` (ERR DB index is out of range), then `ready` anyway.
      if (redis.status !== 'ready') {
        await new Promise<void>((resolve) => redis.once('ready', resolve));
      }
      // Precondition: the connection works and answers PING, on another database.
      await expect(redis.ping()).resolves.toBe('PONG');
      await expect(new RedisReadinessCheck(redis).check()).rejects.toThrow(
        'Redis connection is on database 0, not the configured 42',
      );
    } finally {
      redis.disconnect();
    }
  });
});

import { randomUUID } from 'node:crypto';
import { once } from 'node:events';
import { Test } from '@nestjs/testing';
import { RedisService } from '@infra/redis/redis.service';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { httpConfig } from '@config/http.config';
import { rateLimitConfig } from '@config/rate-limit.config';
import { configureHttpApp } from '@infra/http/configure-http-app';
import { LOG_DESTINATION } from '@infra/logger/log-destination.constants';
import { Logger } from 'nestjs-pino';
import { RATE_LIMIT_REDIS } from '@infra/rate-limit/rate-limit.constants';
import { MEDIA_CLEANUP_SCOPE } from '@modules/media/media-cleanup-scope.constants';
import { AppModule } from '../../src/app.module';
import type { NextFunction, Request, Response } from 'express';
import { enableWorkers } from './enable-workers';
import { testClientAddress } from './test-client-address';
import type { HttpAppOptions } from './http-app-options.type';

/**
 * The real application, set up exactly as `main.ts` sets it up (configureHttpApp:
 * helmet, CORS, trusted proxies, body limit, the /v1 prefix, /docs), and initialised.
 *
 * One difference from production, because suites share one database: the media cleanup
 * acts only on uploads owned by this app's own random id (MEDIA_CLEANUP_SCOPE), so a
 * cleanup run here never removes another suite's expired upload. A suite that tests the
 * cleanup gives its rows that owner (`app.get(MEDIA_CLEANUP_SCOPE)`).
 */
export async function createHttpApp(
  options: HttpAppOptions = {},
): Promise<NestExpressApplication> {
  let builder = Test.createTestingModule({
    imports: [AppModule, ...(options.imports ?? [])],
    controllers: options.controllers ?? [],
  });
  if (options.http !== undefined) {
    builder = builder.overrideProvider(httpConfig.KEY).useValue(options.http);
  }
  if (options.rateLimit !== undefined) {
    builder = builder
      .overrideProvider(rateLimitConfig.KEY)
      .useValue(options.rateLimit);
  }
  if (options.rateLimitRedis !== undefined) {
    builder = builder
      .overrideProvider(RATE_LIMIT_REDIS)
      .useValue(options.rateLimitRedis);
  }
  if (options.logDestination !== undefined) {
    builder = builder
      .overrideProvider(LOG_DESTINATION)
      .useValue(options.logDestination);
  }
  builder = builder
    .overrideProvider(MEDIA_CLEANUP_SCOPE)
    .useValue({ ownerId: randomUUID() });
  builder = enableWorkers(builder, options.workers ?? []);
  for (const override of options.overrides ?? []) {
    builder = builder
      .overrideProvider(override.provide)
      .useValue(override.useValue);
  }
  const moduleRef = await builder.compile();
  // As in main.ts: configureHttpApp registers the body parsers with the configured limit.
  const app = moduleRef.createNestApplication<NestExpressApplication>({
    bodyParser: false,
  });
  // As in main.ts: Nest's Logger writes through the application logger.
  app.useLogger(app.get(Logger));
  // Every request comes from 127.0.0.1, so suites running in parallel would share rate
  // limit counters. As a load balancer would, give each request the address of the test
  // that sends it (testClientAddress), unless the test set X-Forwarded-For itself. It
  // counts because e2e runs trust one proxy hop (scripts/e2e.mjs); a test that sets
  // TRUST_PROXY_HOPS=0 gets the socket address again. Mounted before configureHttpApp,
  // so it runs first; production's HTTP setup is unchanged.
  app.use((req: Request, _res: Response, next: NextFunction) => {
    req.headers['x-forwarded-for'] ??= testClientAddress();
    next();
  });
  configureHttpApp(app);
  await app.init();
  // As a load balancer waits for readiness: until the shared Redis client has
  // connected, the rate limits skip Redis (fail open), so a test's first request would
  // go uncounted.
  const redis = app.get(RedisService);
  if (redis.status !== 'ready') {
    await once(redis, 'ready');
  }
  return app;
}

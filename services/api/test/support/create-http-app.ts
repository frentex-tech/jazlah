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
import { AppModule } from '../../src/app.module';
import { enableWorkers } from './enable-workers';
import type { HttpAppOptions } from './http-app-options.type';

/**
 * The real application, set up exactly as `main.ts` sets it up (configureHttpApp:
 * helmet, CORS, trusted proxies, body limit, the /v1 prefix, /docs), and initialised.
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

import type { Type } from '@nestjs/common';
import type { Redis } from 'ioredis';
import type { DestinationStream } from 'pino';
import type { HttpConfig } from '@config/http-config.type';
import type { RateLimitConfig } from '@config/rate-limit-config.type';

/** What createHttpApp changes from the real application. Everything is optional. */
export type HttpAppOptions = Readonly<{
  /** Test-only controllers mounted beside AppModule. */
  controllers?: Type[];
  /**
   * Modules imported beside AppModule, so those controllers can inject what they export
   * (the same module instance AppModule uses).
   */
  imports?: Type[];
  /** Replaces the `http` config namespace (build it with buildHttpConfig). */
  http?: HttpConfig;
  /** Replaces the `rateLimit` config namespace. */
  rateLimit?: RateLimitConfig;
  /** Replaces the Redis client of the rate limit storage. */
  rateLimitRedis?: Redis;
  /** Where the application logger writes; set it to capture log lines (LogCapture). */
  logDestination?: DestinationStream;
  /**
   * Providers replaced by a value (`{ provide: STORAGE_PORT, useValue: fake }`), for
   * what has no option of its own above.
   */
  overrides?: readonly Readonly<{ provide: unknown; useValue: unknown }>[];
  /**
   * The workers (processors, schedulers) to turn on; every other worker stays off, as
   * QUEUE_WORKERS_ENABLED is false in e2e runs (enableWorkers).
   */
  workers?: readonly Type[];
}>;

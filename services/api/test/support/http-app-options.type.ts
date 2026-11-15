import type { Type } from '@nestjs/common';
import type { Redis } from 'ioredis';
import type { DestinationStream } from 'pino';
import type { HttpConfig } from '@config/http-config.type';
import type { RateLimitConfig } from '@config/rate-limit-config.type';

/** What createHttpApp changes from the real application. Everything is optional. */
export type HttpAppOptions = Readonly<{
  /** Test-only controllers mounted beside AppModule. */
  controllers?: Type[];
  /** Replaces the `http` config namespace (build it with buildHttpConfig). */
  http?: HttpConfig;
  /** Replaces the `rateLimit` config namespace. */
  rateLimit?: RateLimitConfig;
  /** Replaces the Redis client of the rate limit storage. */
  rateLimitRedis?: Redis;
  /** Where the application logger writes; set it to capture log lines (LogCapture). */
  logDestination?: DestinationStream;
}>;

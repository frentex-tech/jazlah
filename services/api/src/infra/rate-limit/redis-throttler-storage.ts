import { Inject, Injectable, Logger } from '@nestjs/common';
import type { ThrottlerStorage } from '@nestjs/throttler';
import type { Redis } from 'ioredis';
import { withTimeout } from '@common/async/with-timeout';
import { INCREMENT_HITS_SCRIPT } from './increment-hits.script';
import { InvalidRateLimitReplyError } from './invalid-rate-limit-reply.error';
import { rateLimitKeys } from './rate-limit-keys';
import { RateLimitStorageUnavailableError } from './rate-limit-storage-unavailable.error';
import { RedisNotReadyError } from './redis-not-ready.error';
import type { ThrottlerStorageRecord } from './throttler-storage-record.type';
import {
  RATE_LIMIT_REDIS,
  RATE_LIMIT_STORAGE_TIMEOUT_MS,
} from './rate-limit.constants';

/**
 * The throttler's storage, in Redis, so every API instance counts against the same
 * limits. One atomic script per request (INCREMENT_HITS_SCRIPT); keys are hashed and
 * hash-tagged (rateLimitKeys), and expire with their window or block.
 *
 * When it cannot count a request it throws RateLimitStorageUnavailableError, and the
 * caller decides (the guard and the pre-routing limiter fail open unless the endpoint
 * fails closed). That happens:
 * - at once, without sending anything, while the shared client is not connected
 *   (`status` is not `ready`), so an outage costs a request no time;
 * - when Redis errors or answers oddly;
 * - when a connected Redis does not answer within RATE_LIMIT_STORAGE_TIMEOUT_MS.
 * A warning is logged once per outage, and an info line when Redis answers again.
 */
@Injectable()
export class RedisThrottlerStorage implements ThrottlerStorage {
  private readonly logger = new Logger(RedisThrottlerStorage.name);
  private failing = false;

  constructor(@Inject(RATE_LIMIT_REDIS) private readonly redis: Redis) {}

  async increment(
    key: string,
    ttl: number,
    limit: number,
    blockDuration: number,
  ): Promise<ThrottlerStorageRecord> {
    let record: ThrottlerStorageRecord;
    try {
      if (this.redis.status !== 'ready') {
        throw new RedisNotReadyError(this.redis.status);
      }
      const keys = rateLimitKeys(key);
      const reply = await withTimeout(
        this.redis.eval(
          INCREMENT_HITS_SCRIPT,
          2,
          keys.hits,
          keys.blocked,
          ttl,
          limit,
          blockDuration,
        ),
        RATE_LIMIT_STORAGE_TIMEOUT_MS,
      );
      record = this.toRecord(reply);
    } catch (error) {
      if (!this.failing) {
        this.failing = true;
        this.logger.warn(
          { err: error },
          'Rate limit storage unavailable: requests are not rate limited until Redis answers again, except on endpoints that fail closed',
        );
      }
      throw new RateLimitStorageUnavailableError({ cause: error });
    }
    if (this.failing) {
      this.failing = false;
      this.logger.log('Rate limit storage available again');
    }
    return record;
  }

  private toRecord(reply: unknown): ThrottlerStorageRecord {
    if (
      !Array.isArray(reply) ||
      reply.length !== 4 ||
      !reply.every((value) => typeof value === 'number')
    ) {
      throw new InvalidRateLimitReplyError();
    }
    const [hits, windowMs, blocked, blockMs] = reply;
    return {
      totalHits: hits,
      // The throttler reports these in seconds (Retry-After, X-RateLimit-Reset).
      timeToExpire: Math.ceil(windowMs / 1000),
      isBlocked: blocked === 1,
      timeToBlockExpire: Math.ceil(blockMs / 1000),
    };
  }
}

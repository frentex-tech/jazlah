import { Inject, Injectable } from '@nestjs/common';
import type { RateLimitOptions } from '@common/decorators/rate-limit-options.type';
import type { RateLimitPolicy } from '@common/decorators/rate-limit-policy.type';
import { resolveRateLimitPolicy } from '@common/decorators/resolve-rate-limit-policy';
import { toRateLimitDeclaration } from '@common/decorators/to-rate-limit-declaration';
import { AppError } from '@common/errors/app-error';
import { ErrorCode } from '@common/errors/error-code.enum';
import { rateLimitConfig } from '@config/rate-limit.config';
import type { RateLimitConfig } from '@config/rate-limit-config.type';
import { InvalidRateLimitSetupError } from './invalid-rate-limit-setup.error';
import { keyedRateLimitKey } from './keyed-rate-limit-key';
import { RateLimitStorageUnavailableError } from './rate-limit-storage-unavailable.error';
import { RedisThrottlerStorage } from './redis-throttler-storage';

/**
 * Rate limits counted by a key the caller supplies (a phone number, an account), for
 * limits that are not per client address. `@RateLimit` stays the way to limit an
 * endpoint per address; this is the same thing called from code: the same options
 * (written numbers or `from` configuration), the same validation, the same storage and
 * script, the same fail-closed behaviour.
 *
 *   await this.rateLimiter.consume(
 *     { name: 'otp-request-phone', failClosed: true, from: (limits) => limits.otpRequestPhone },
 *     phoneKey,
 *   );
 *
 * - Counts one request against the counter `name` for `key`. Over the limit: throws
 *   RATE_LIMITED (429) carrying `retryAfterSeconds`, which the error filter sends as
 *   Retry-After.
 * - While the storage cannot count: throws SERVICE_UNAVAILABLE (503) when the options
 *   say `failClosed`, otherwise lets the request through (the storage logs the outage).
 * - A name used with two different settings throws InvalidRateLimitSetupError: a
 *   counter has one set of settings.
 * - The key is hashed (SHA-256) before it reaches Redis, with the rest of the storage
 *   key. A key built from personal data such as a phone number must already be a keyed
 *   hash (HMAC) when it gets here: a plain SHA-256 of a phone number can be reversed by
 *   trying every number.
 */
@Injectable()
export class RateLimiter {
  private readonly policies = new Map<string, RateLimitPolicy>();

  constructor(
    private readonly storage: RedisThrottlerStorage,
    @Inject(rateLimitConfig.KEY)
    private readonly config: Pick<RateLimitConfig, 'configured'>,
  ) {}

  async consume(options: RateLimitOptions, key: string): Promise<void> {
    const policy = this.policyOf(options);
    let blockedForSeconds: number | undefined;
    try {
      const record = await this.storage.increment(
        keyedRateLimitKey(policy.name, key),
        policy.windowMs,
        policy.limit,
        policy.blockMs,
      );
      blockedForSeconds = record.isBlocked
        ? record.timeToBlockExpire
        : undefined;
    } catch (error) {
      if (!(error instanceof RateLimitStorageUnavailableError)) {
        throw error;
      }
      if (policy.failClosed) {
        throw new AppError(ErrorCode.SERVICE_UNAVAILABLE, { cause: error });
      }
      return;
    }
    if (blockedForSeconds !== undefined) {
      throw new AppError(ErrorCode.RATE_LIMITED, {
        retryAfterSeconds: blockedForSeconds,
      });
    }
  }

  private policyOf(options: RateLimitOptions): RateLimitPolicy {
    const policy = resolveRateLimitPolicy(
      toRateLimitDeclaration(options),
      this.config.configured,
    );
    const first = this.policies.get(policy.name);
    if (first === undefined) {
      this.policies.set(policy.name, policy);
    } else if (
      first.limit !== policy.limit ||
      first.windowMs !== policy.windowMs ||
      first.blockMs !== policy.blockMs ||
      first.failClosed !== policy.failClosed
    ) {
      throw new InvalidRateLimitSetupError(
        `The rate limit counter "${policy.name}" is used with different settings. A counter has one set of settings: use one setting, or another name.`,
      );
    }
    return policy;
  }
}

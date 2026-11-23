import { Inject, Injectable } from '@nestjs/common';
import { normalizeIp } from '@nestjs/throttler';
import type { NextFunction, Request, Response } from 'express';
import { AppError } from '@common/errors/app-error';
import { ErrorCode } from '@common/errors/error-code.enum';
import { rateLimitConfig } from '@config/rate-limit.config';
import type { RateLimitConfig } from '@config/rate-limit-config.type';
import { RateLimitStorageUnavailableError } from './rate-limit-storage-unavailable.error';
import {
  PRE_ROUTING_EXEMPT_PATHS,
  PRE_ROUTING_RATE_LIMITER,
} from './rate-limit.constants';
import { RedisThrottlerStorage } from './redis-throttler-storage';

/**
 * A per-address limit counted before routing and before the body is parsed, so
 * requests to unknown routes and malformed requests are limited too (the throttler's
 * guard only runs on matched routes). Mounted as Express middleware by
 * `configureHttpApp`, after the request logger.
 *
 * RATE_LIMIT_PRE_ROUTING_MAX_REQUESTS per RATE_LIMIT_WINDOW_MS per `req.ip`, on its own
 * counter (`pre-routing`), in the same Redis storage. It fails open: while Redis is
 * unavailable every request goes on. The health checks are not counted. Over the limit:
 * 429 RATE_LIMITED with Retry-After, through the global error filter.
 */
@Injectable()
export class PreRoutingRateLimiter {
  constructor(
    @Inject(rateLimitConfig.KEY) private readonly config: RateLimitConfig,
    private readonly storage: RedisThrottlerStorage,
  ) {}

  /** The Express middleware. */
  readonly handle = (req: Request, res: Response, next: NextFunction): void => {
    this.count(req, res).then(() => next(), next);
  };

  private async count(req: Request, res: Response): Promise<void> {
    if (PRE_ROUTING_EXEMPT_PATHS.has(req.path)) {
      return;
    }
    const client = normalizeIp(req.ip ?? req.socket.remoteAddress ?? '');
    let blockedForSeconds: number | undefined;
    try {
      const record = await this.storage.increment(
        `${PRE_ROUTING_RATE_LIMITER}:client:${client}`,
        this.config.windowMs,
        this.config.preRoutingMaxRequests,
        this.config.windowMs,
      );
      blockedForSeconds = record.isBlocked
        ? record.timeToBlockExpire
        : undefined;
    } catch (error) {
      if (error instanceof RateLimitStorageUnavailableError) {
        return;
      }
      throw error;
    }
    if (blockedForSeconds !== undefined) {
      res.setHeader('Retry-After', blockedForSeconds);
      throw new AppError(ErrorCode.RATE_LIMITED);
    }
  }
}

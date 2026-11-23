import { Inject, Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import type { ThrottlerRequest } from '@nestjs/throttler';
import { RATE_LIMIT_POLICY } from '@common/decorators/rate-limit.constants';
import type { RateLimitDeclaration } from '@common/decorators/rate-limit-declaration.type';
import type { RateLimitPolicy } from '@common/decorators/rate-limit-policy.type';
import { resolveRateLimitPolicy } from '@common/decorators/resolve-rate-limit-policy';
import { AppError } from '@common/errors/app-error';
import { ErrorCode } from '@common/errors/error-code.enum';
import { rateLimitConfig } from '@config/rate-limit.config';
import type { RateLimitConfig } from '@config/rate-limit-config.type';
import { RateLimitStorageUnavailableError } from './rate-limit-storage-unavailable.error';

/**
 * The global rate limit guard: @nestjs/throttler's guard, plus two things.
 *
 * - An endpoint with `@RateLimit` is counted with the limit, window and block of its
 *   declaration, whether its numbers were written in the decorator or come from
 *   configuration (resolveRateLimitPolicy, as the startup check resolves them).
 * - When the storage cannot count the request, it goes through unlimited (fail open);
 *   an endpoint with `@RateLimit({ failClosed: true })` is refused with
 *   503 SERVICE_UNAVAILABLE instead.
 */
@Injectable()
export class RateLimitGuard extends ThrottlerGuard {
  // Property injection: the constructor is the throttler's.
  @Inject(rateLimitConfig.KEY)
  private readonly rateLimits!: RateLimitConfig;

  protected override async handleRequest(
    request: ThrottlerRequest,
  ): Promise<boolean> {
    const policy = this.policyOf(request);
    try {
      return await super.handleRequest(
        policy === undefined
          ? request
          : {
              ...request,
              limit: policy.limit,
              ttl: policy.windowMs,
              blockDuration: policy.blockMs,
            },
      );
    } catch (error) {
      if (!(error instanceof RateLimitStorageUnavailableError)) {
        throw error;
      }
      if (policy?.failClosed === true) {
        throw new AppError(ErrorCode.SERVICE_UNAVAILABLE, { cause: error });
      }
      return true;
    }
  }

  private policyOf(request: ThrottlerRequest): RateLimitPolicy | undefined {
    const declaration = this.reflector.getAllAndOverride<
      RateLimitDeclaration | undefined
    >(RATE_LIMIT_POLICY, [
      request.context.getHandler(),
      request.context.getClass(),
    ]);
    return declaration === undefined
      ? undefined
      : resolveRateLimitPolicy(declaration, this.rateLimits.configured);
  }
}

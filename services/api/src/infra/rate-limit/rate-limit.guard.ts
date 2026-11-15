import { Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import type { ThrottlerRequest } from '@nestjs/throttler';
import { RATE_LIMIT_POLICY } from '@common/decorators/rate-limit.constants';
import type { RateLimitPolicy } from '@common/decorators/rate-limit-policy.type';
import { AppError } from '@common/errors/app-error';
import { ErrorCode } from '@common/errors/error-code.enum';
import { RateLimitStorageUnavailableError } from './rate-limit-storage-unavailable.error';

/**
 * The global rate limit guard: @nestjs/throttler's guard, plus what to do when the
 * storage cannot count the request. By default the request goes through unlimited
 * (fail open); an endpoint with `@RateLimit({ failClosed: true })` is refused with
 * 503 SERVICE_UNAVAILABLE instead.
 */
@Injectable()
export class RateLimitGuard extends ThrottlerGuard {
  protected override async handleRequest(
    request: ThrottlerRequest,
  ): Promise<boolean> {
    try {
      return await super.handleRequest(request);
    } catch (error) {
      if (!(error instanceof RateLimitStorageUnavailableError)) {
        throw error;
      }
      const policy = this.reflector.getAllAndOverride<
        RateLimitPolicy | undefined
      >(RATE_LIMIT_POLICY, [
        request.context.getHandler(),
        request.context.getClass(),
      ]);
      if (policy?.failClosed === true) {
        throw new AppError(ErrorCode.SERVICE_UNAVAILABLE, { cause: error });
      }
      return true;
    }
  }
}

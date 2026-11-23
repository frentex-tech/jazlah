import { Controller, Get } from '@nestjs/common';
import { RateLimit } from '@infra/rate-limit/rate-limit.decorator';
import { AUTH_PROBE_LIMIT } from './auth-probe.constants';

/**
 * A customer endpoint with a strict rate limit, for the guard order test: requests
 * with a bad token must be counted before they are refused.
 */
@Controller('customer/auth-probe')
export class AuthProbeController {
  @Get('limited')
  @RateLimit(AUTH_PROBE_LIMIT)
  limited(): { ok: true } {
    return { ok: true };
  }
}

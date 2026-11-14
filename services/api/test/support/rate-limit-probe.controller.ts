import { Controller, Get } from '@nestjs/common';
import { RateLimit } from '@infra/rate-limit/rate-limit.decorator';
import {
  FAIL_CLOSED_PROBE_LIMIT,
  SHARED_PROBE_LIMIT,
  STRICT_PROBE_LIMIT,
} from './rate-limit-probe.constants';

/** Endpoints for the rate limit tests, mounted only in e2e tests. */
@Controller('rate-limit-probe')
export class RateLimitProbeController {
  /** Limited by the default limit only (fails open). */
  @Get('default')
  default(): { ok: true } {
    return { ok: true };
  }

  /** A second endpoint under the default limit, to show the counter is per client. */
  @Get('other')
  other(): { ok: true } {
    return { ok: true };
  }

  /** A stricter limit than the default, with its own counter. */
  @Get('strict')
  @RateLimit(STRICT_PROBE_LIMIT)
  strict(): { ok: true } {
    return { ok: true };
  }

  /** One of two endpoints sharing the counter `probe-shared`. */
  @Get('shared-a')
  @RateLimit(SHARED_PROBE_LIMIT)
  sharedA(): { ok: true } {
    return { ok: true };
  }

  /** The other endpoint sharing the counter `probe-shared`. */
  @Get('shared-b')
  @RateLimit(SHARED_PROBE_LIMIT)
  sharedB(): { ok: true } {
    return { ok: true };
  }

  /** Refused with 503 while Redis is unavailable. */
  @Get('fail-closed')
  @RateLimit(FAIL_CLOSED_PROBE_LIMIT)
  failClosed(): { ok: true } {
    return { ok: true };
  }
}

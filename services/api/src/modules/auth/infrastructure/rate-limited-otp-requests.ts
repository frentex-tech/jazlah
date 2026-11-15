import { createHmac } from 'node:crypto';
import { Inject, Injectable } from '@nestjs/common';
import type { Audience } from '@common/auth/audience.type';
import { authConfig } from '@config/auth.config';
import type { AuthConfig } from '@config/auth-config.type';
import { RateLimiter } from '@infra/rate-limit/rate-limiter';
import type { OtpRequestLimit } from '../domain/ports/otp-request-limit.port';
import {
  OTP_REQUEST_PHONE_DAILY_LIMIT,
  OTP_REQUEST_PHONE_LIMIT,
} from './otp-request-phone-limits.constants';

/**
 * The per-phone limits on code requests, counted with RateLimiter for each phone and
 * audience separately, so abusing one audience cannot lock the phone out of another:
 *
 * - every audience: the short window (AUTH_OTP_PHONE_LIMIT per
 *   AUTH_OTP_PHONE_WINDOW_SECONDS);
 * - customer only: the day (AUTH_OTP_PHONE_DAILY_LIMIT). It exists to bound what SMS
 *   cost one phone can cause, and anyone may request customer codes. Staff audiences
 *   keep the short window only: staff are few, and a day's lockout of a staff phone by
 *   a stranger would stop that person working.
 *
 * Both fail closed. The phone never reaches the limiter or Redis: the key is the
 * HMAC-SHA256, with AUTH_OTP_SECRET, of the phone and the audience. A plain hash of a
 * phone number could be reversed by trying every number.
 */
@Injectable()
export class RateLimitedOtpRequests implements OtpRequestLimit {
  constructor(
    private readonly rateLimiter: RateLimiter,
    @Inject(authConfig.KEY)
    private readonly config: Pick<AuthConfig, 'otpSecret'>,
  ) {}

  async consume(phone: string, audience: Audience): Promise<void> {
    const key = createHmac('sha256', this.config.otpSecret)
      .update(`rate-limit\n${phone}\n${audience}`)
      .digest('hex');
    await this.rateLimiter.consume(OTP_REQUEST_PHONE_LIMIT, key);
    if (audience === 'customer') {
      await this.rateLimiter.consume(OTP_REQUEST_PHONE_DAILY_LIMIT, key);
    }
  }
}

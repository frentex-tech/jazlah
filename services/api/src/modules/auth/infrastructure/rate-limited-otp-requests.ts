import { createHmac } from 'node:crypto';
import { Inject, Injectable } from '@nestjs/common';
import { authConfig } from '@config/auth.config';
import type { AuthConfig } from '@config/auth-config.type';
import { RateLimiter } from '@infra/rate-limit/rate-limiter';
import type { OtpRequestLimit } from '../domain/ports/otp-request-limit.port';
import {
  OTP_REQUEST_PHONE_DAILY_LIMIT,
  OTP_REQUEST_PHONE_LIMIT,
} from './otp-request-phone-limits.constants';

/**
 * The per-phone limits on code requests, counted with RateLimiter: a short window
 * first, then a day (AUTH_OTP_PHONE_*). Both fail closed.
 *
 * The phone never reaches the limiter or Redis: the key is its HMAC-SHA256 with
 * AUTH_OTP_SECRET. A plain hash of a phone number could be reversed by trying every
 * number.
 */
@Injectable()
export class RateLimitedOtpRequests implements OtpRequestLimit {
  constructor(
    private readonly rateLimiter: RateLimiter,
    @Inject(authConfig.KEY)
    private readonly config: Pick<AuthConfig, 'otpSecret'>,
  ) {}

  async consume(phone: string): Promise<void> {
    const key = createHmac('sha256', this.config.otpSecret)
      .update(`rate-limit\n${phone}`)
      .digest('hex');
    await this.rateLimiter.consume(OTP_REQUEST_PHONE_LIMIT, key);
    await this.rateLimiter.consume(OTP_REQUEST_PHONE_DAILY_LIMIT, key);
  }
}

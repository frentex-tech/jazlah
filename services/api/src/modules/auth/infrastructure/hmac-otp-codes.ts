import {
  createHmac,
  randomBytes,
  randomInt,
  timingSafeEqual,
} from 'node:crypto';
import { Inject, Injectable } from '@nestjs/common';
import { authConfig } from '@config/auth.config';
import type { AuthConfig } from '@config/auth-config.type';
import type { OtpCodeTarget } from '../domain/otp-code-target.type';
import type { OtpCodes } from '../domain/ports/otp-codes.port';

/**
 * Verification codes: random Latin digits (AUTH_OTP_LENGTH of them, from the system's
 * secure random source), stored as HMAC-SHA256 keyed with AUTH_OTP_SECRET over the
 * phone, the audience and the code.
 *
 * Why a keyed hash and not a slow password hash: a code has at most a hundred million
 * values, so any hash of it alone is reversed by trying them all; the secret, which is
 * not in the database, is what protects a leaked row. The attempt limit protects
 * against guessing through the API.
 */
@Injectable()
export class HmacOtpCodes implements OtpCodes {
  constructor(
    @Inject(authConfig.KEY)
    private readonly config: Pick<AuthConfig, 'otpSecret' | 'otpLength'>,
  ) {}

  generate(): string {
    let code = '';
    for (let digit = 0; digit < this.config.otpLength; digit += 1) {
      code += String(randomInt(10));
    }
    return code;
  }

  hash(target: OtpCodeTarget, code: string): string {
    return this.hmac(`${target.phone}\n${target.audience}\n${code}`);
  }

  unmatchableHash(): string {
    // Random bytes instead of a code: a real HMAC, so it looks like any other row, and
    // no input of the form phone, audience, code produces it.
    return this.hmac(randomBytes(32));
  }

  matches(target: OtpCodeTarget, code: string, hash: string): boolean {
    const expected = Buffer.from(this.hash(target, code), 'hex');
    const stored = Buffer.from(hash, 'hex');
    return (
      expected.length === stored.length && timingSafeEqual(expected, stored)
    );
  }

  private hmac(input: string | Buffer): string {
    return createHmac('sha256', this.config.otpSecret)
      .update(input)
      .digest('hex');
  }
}

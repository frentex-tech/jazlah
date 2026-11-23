import type { RateLimitOptions } from '@common/decorators/rate-limit-options.type';
import type { RateLimiter } from '@infra/rate-limit/rate-limiter';
import {
  OTP_REQUEST_PHONE_DAILY_LIMIT,
  OTP_REQUEST_PHONE_LIMIT,
} from './otp-request-phone-limits.constants';
import { RateLimitedOtpRequests } from './rate-limited-otp-requests';

/** Obviously fictitious. */
const PHONE = '+966512345678';
const SECRET = 'example-otp-secret-that-is-at-least-32-characters';

function build() {
  const consumed: { counter: string; key: string }[] = [];
  const rateLimiter = {
    consume: (options: RateLimitOptions, key: string): Promise<void> => {
      consumed.push({ counter: options.name, key });
      return Promise.resolve();
    },
  } as unknown as RateLimiter;
  const limits = new RateLimitedOtpRequests(rateLimiter, {
    otpSecret: SECRET,
  });
  return { limits, consumed };
}

describe('RateLimitedOtpRequests', () => {
  it('counts a customer request on the short window and the day', async () => {
    const { limits, consumed } = build();

    await limits.consume(PHONE, 'customer');

    expect(consumed.map((entry) => entry.counter)).toEqual([
      OTP_REQUEST_PHONE_LIMIT.name,
      OTP_REQUEST_PHONE_DAILY_LIMIT.name,
    ]);
  });

  it.each(['vendor', 'kitchen', 'admin'] as const)(
    'counts a %s request on the short window only: no daily cap for staff',
    async (audience) => {
      const { limits, consumed } = build();

      await limits.consume(PHONE, audience);

      expect(consumed.map((entry) => entry.counter)).toEqual([
        OTP_REQUEST_PHONE_LIMIT.name,
      ]);
    },
  );

  it('keys each audience on its own, so one cannot use up another', async () => {
    const { limits, consumed } = build();

    await limits.consume(PHONE, 'customer');
    await limits.consume(PHONE, 'vendor');
    await limits.consume(PHONE, 'customer');

    const shortWindow = consumed
      .filter((entry) => entry.counter === OTP_REQUEST_PHONE_LIMIT.name)
      .map((entry) => entry.key);
    expect(shortWindow[0]).toBe(shortWindow[2]);
    expect(shortWindow[1]).not.toBe(shortWindow[0]);
  });

  it('never puts the phone in the key: an HMAC of it, in hex', async () => {
    const { limits, consumed } = build();

    await limits.consume(PHONE, 'customer');

    for (const { key } of consumed) {
      expect(key).toMatch(/^[0-9a-f]{64}$/);
      expect(key).not.toContain(PHONE.slice(1));
    }
  });
});

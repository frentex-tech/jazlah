import { InvalidRateLimitOptionsError } from './invalid-rate-limit-options.error';
import { toRateLimitPolicy } from './to-rate-limit-policy';

const VALID = { name: 'otp-request', limit: 5, windowMs: 60_000 };

describe('toRateLimitPolicy', () => {
  it('applies the defaults: block = window, fail open', () => {
    expect(toRateLimitPolicy(VALID)).toEqual({
      ...VALID,
      blockMs: 60_000,
      failClosed: false,
    });
  });

  it('keeps a longer block and failClosed', () => {
    expect(
      toRateLimitPolicy({ ...VALID, blockMs: 120_000, failClosed: true }),
    ).toMatchObject({ blockMs: 120_000, failClosed: true });
  });

  it('rejects a block shorter than the window', () => {
    expect(() => toRateLimitPolicy({ ...VALID, blockMs: 59_999 })).toThrow(
      '@RateLimit "otp-request": blockMs must not be shorter than windowMs',
    );
  });

  it.each([
    ['limit', 0],
    ['limit', -1],
    ['limit', 1.5],
    ['windowMs', 0],
    ['windowMs', -60_000],
    ['windowMs', 0.5],
    ['windowMs', Number.NaN],
    ['blockMs', 0],
    ['blockMs', 60_000.5],
  ])('rejects %s = %p', (field, value) => {
    expect(() => toRateLimitPolicy({ ...VALID, [field]: value })).toThrow(
      `@RateLimit "otp-request": ${field} must be a positive whole number`,
    );
  });

  it.each(['', 'OTP', 'otp request', '-otp', 'otp-'])(
    'rejects the name %p',
    (name) => {
      expect(() => toRateLimitPolicy({ ...VALID, name })).toThrow(
        InvalidRateLimitOptionsError,
      );
    },
  );
});

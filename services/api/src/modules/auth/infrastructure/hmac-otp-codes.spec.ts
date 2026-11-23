import { HmacOtpCodes } from './hmac-otp-codes';

/** Obviously not real secrets. */
const SECRET = 'example-otp-secret-0123456789-abcdefghij';
const TARGET = { phone: '+966512345678', audience: 'customer' } as const;

function codes(otpLength = 6, otpSecret = SECRET): HmacOtpCodes {
  return new HmacOtpCodes({ otpSecret, otpLength });
}

describe('HmacOtpCodes', () => {
  it.each([4, 6, 8])('generates %d Latin digits', (length) => {
    for (let i = 0; i < 50; i += 1) {
      expect(codes(length).generate()).toMatch(new RegExp(`^\\d{${length}}$`));
    }
  });

  it('does not hand out the same code every time', () => {
    const generated = new Set(
      Array.from({ length: 30 }, () => codes().generate()),
    );

    expect(generated.size).toBeGreaterThan(1);
  });

  it('never stores the code: the hash is 64 hex characters without it', () => {
    const hash = codes().hash(TARGET, '482913');

    expect(hash).toMatch(/^[0-9a-f]{64}$/);
    expect(hash).not.toContain('482913');
  });

  it('matches the code it hashed', () => {
    const hash = codes().hash(TARGET, '482913');

    expect(codes().matches(TARGET, '482913', hash)).toBe(true);
  });

  it.each([
    ['another code', TARGET, '482914'],
    ['another phone', { ...TARGET, phone: '+966511112222' }, '482913'],
    ['another audience', { ...TARGET, audience: 'admin' as const }, '482913'],
  ])('does not match %s', (_label, target, code) => {
    const hash = codes().hash(TARGET, '482913');

    expect(codes().matches(target, code, hash)).toBe(false);
  });

  it('depends on the secret: the same code under another secret does not match', () => {
    const hash = codes().hash(TARGET, '482913');
    const other = codes(6, 'another-example-secret-0123456789abcdef');

    expect(other.matches(TARGET, '482913', hash)).toBe(false);
  });

  it('gives an unmatchable hash the form of a real one, different each time', () => {
    const first = codes().unmatchableHash();
    const second = codes().unmatchableHash();

    expect(first).toMatch(/^[0-9a-f]{64}$/);
    expect(second).not.toBe(first);
  });

  it('matches no code against an unmatchable hash', () => {
    const subject = codes(4);
    const hash = subject.unmatchableHash();

    for (let code = 0; code < 10_000; code += 1) {
      expect(subject.matches(TARGET, String(code).padStart(4, '0'), hash)).toBe(
        false,
      );
    }
  });

  it('answers false, without throwing, for a stored hash that is not a hash', () => {
    expect(codes().matches(TARGET, '482913', 'not-hex')).toBe(false);
    expect(codes().matches(TARGET, '482913', '')).toBe(false);
  });
});

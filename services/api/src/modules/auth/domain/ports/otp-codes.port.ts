import type { OtpCodeTarget } from '../otp-code-target.type';

/** Injection token of OtpCodes. */
export const OTP_CODES = Symbol('OTP_CODES');

/** Making, hashing and checking verification codes. The code itself is never stored. */
export interface OtpCodes {
  /** A new random code of the configured number of Latin digits. */
  generate(): string;

  /** The hash stored for `code` issued for `target`. */
  hash(target: OtpCodeTarget, code: string): string;

  /**
   * A hash that no code matches, in the same form as a real one: what is stored for a
   * request that must not be verifiable.
   */
  unmatchableHash(): string;

  /** Whether `code` is the one `hash` was made from, compared in constant time. */
  matches(target: OtpCodeTarget, code: string, hash: string): boolean;
}

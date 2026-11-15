import type { Audience } from '@common/auth/audience.type';
import type { NewOtpChallenge } from '../new-otp-challenge.type';
import type { OtpChallenge } from '../otp-challenge.entity';

/** Injection token of the OtpChallengeRepository. */
export const OTP_CHALLENGE_REPOSITORY = Symbol('OTP_CHALLENGE_REPOSITORY');

/**
 * Where verification challenges are kept. The two state changes are conditional and
 * atomic, so requests racing each other cannot both win.
 */
export interface OtpChallengeRepository {
  create(challenge: NewOtpChallenge): Promise<OtpChallenge>;

  /** The most recently created challenge of the phone and audience, whatever its state. */
  findNewest(phone: string, audience: Audience): Promise<OtpChallenge | null>;

  /**
   * Counts one verification attempt, only while the challenge is not consumed, not
   * expired and has attempts left. False when it could not: the caller must not
   * compare a code then.
   */
  claimAttempt(id: string, maxAttempts: number, now: Date): Promise<boolean>;

  /** Marks it consumed, only if it is not already. False when another request did first. */
  consume(id: string, now: Date): Promise<boolean>;

  /** Removes a challenge whose code never reached the user. */
  delete(id: string): Promise<void>;

  /**
   * Replaces the stored hash with `codeHash`, one no code matches: the challenge can
   * never be verified, yet it stays the newest, so the resend wait still applies.
   */
  makeUnverifiable(id: string, codeHash: string): Promise<void>;
}

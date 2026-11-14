import type { Audience } from '@common/auth/audience.type';
import type { OtpChallengeState } from './otp-challenge-state.type';

/**
 * One verification code issued for a phone and an audience. It holds the code's hash,
 * never the code. The rules of its life are here:
 *
 * - It can be verified until it expires, until a correct code consumes it, or until
 *   its attempts are used up, whichever comes first (`state`).
 * - Only the newest challenge of a phone and audience is ever looked at, so issuing a
 *   new code invalidates the previous one (the repository's `findNewest`).
 * - A new code may be requested only once `resendWaitSeconds` reaches zero.
 */
export class OtpChallenge {
  constructor(
    readonly id: string,
    readonly phone: string,
    readonly audience: Audience,
    readonly codeHash: string,
    readonly expiresAt: Date,
    /** Verification attempts already claimed, right or wrong. */
    readonly attempts: number,
    /** Null until a correct code consumed it. */
    readonly consumedAt: Date | null,
    readonly createdAt: Date,
  ) {}

  /** Whether a code may still be tried against it, and if not, why. */
  state(now: Date, maxAttempts: number): OtpChallengeState {
    if (this.consumedAt !== null) {
      return 'consumed';
    }
    if (now.getTime() >= this.expiresAt.getTime()) {
      return 'expired';
    }
    if (this.attempts >= maxAttempts) {
      return 'exhausted';
    }
    return 'usable';
  }

  /**
   * How long a client still has to wait before asking for another code, in whole
   * seconds rounded up; zero when it may ask now.
   */
  resendWaitSeconds(now: Date, waitSeconds: number): number {
    const elapsedMs = now.getTime() - this.createdAt.getTime();
    const remainingMs = waitSeconds * 1000 - elapsedMs;
    return remainingMs <= 0 ? 0 : Math.ceil(remainingMs / 1000);
  }
}

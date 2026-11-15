import type { RefreshTokenState } from './refresh-token-state.type';

/**
 * One refresh token of a session, by its hash. A session's tokens form a chain: each
 * is exchanged once for its successor (rotation). A token presented after it was
 * exchanged means two parties hold it, so the whole session is revoked (reuse
 * detection); that is why `used` is reported before `expired`.
 */
export class RefreshToken {
  constructor(
    readonly id: string,
    readonly sessionId: string,
    readonly tokenHash: string,
    readonly expiresAt: Date,
    /** Null until it was exchanged for its successor. */
    readonly usedAt: Date | null,
  ) {}

  state(now: Date): RefreshTokenState {
    if (this.usedAt !== null) {
      return 'used';
    }
    if (now.getTime() >= this.expiresAt.getTime()) {
      return 'expired';
    }
    return 'usable';
  }
}

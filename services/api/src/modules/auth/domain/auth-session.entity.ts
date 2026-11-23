import type { Audience } from '@common/auth/audience.type';
import type { DevicePlatform } from './device-platform.type';
import { RECENT_SIGN_IN_SECONDS } from './recent-sign-in.constants';
import type { SessionRevocationReason } from './session-revocation-reason.type';

/**
 * One sign-in: a user, exactly one audience, one device. A staff session also carries
 * the organisation (vendor or kitchen) the user acts for. It ends when it is revoked,
 * or when its last refresh token expires unused.
 */
export class AuthSession {
  constructor(
    readonly id: string,
    readonly userId: string,
    readonly audience: Audience,
    /** Null for customer and admin sessions. */
    readonly organisationId: string | null,
    /** Null when the client sent none at sign-in. */
    readonly deviceName: string | null,
    readonly devicePlatform: DevicePlatform,
    /** The sign-in, then the last refresh. */
    readonly lastUsedAt: Date,
    /** Null while the session is active. */
    readonly revokedAt: Date | null,
    /** Null unless revoked. */
    readonly revocationReason: SessionRevocationReason | null,
    /** The sign-in: when the code was verified. A refresh does not change it. */
    readonly signedInAt: Date,
  ) {}

  get isActive(): boolean {
    return this.revokedAt === null;
  }

  /**
   * Whether the session is active and its sign-in happened at most
   * RECENT_SIGN_IN_SECONDS before `now`: the proof of presence an action that cannot be
   * undone asks for. Refreshing does not renew it; only a new sign-in does.
   */
  isRecentSignIn(now: Date): boolean {
    return (
      this.isActive &&
      now.getTime() - this.signedInAt.getTime() <= RECENT_SIGN_IN_SECONDS * 1000
    );
  }
}

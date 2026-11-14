import type { Audience } from '@common/auth/audience.type';
import type { DevicePlatform } from './device-platform.type';
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
  ) {}

  get isActive(): boolean {
    return this.revokedAt === null;
  }
}

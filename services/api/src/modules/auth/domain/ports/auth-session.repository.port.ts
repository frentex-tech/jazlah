import type { Audience } from '@common/auth/audience.type';
import type { AuthSession } from '../auth-session.entity';
import type { NewAuthSession } from '../new-auth-session.type';
import type { SessionRevocationReason } from '../session-revocation-reason.type';

/** Injection token of the AuthSessionRepository. */
export const AUTH_SESSION_REPOSITORY = Symbol('AUTH_SESSION_REPOSITORY');

/** Where sessions are kept. */
export interface AuthSessionRepository {
  create(session: NewAuthSession): Promise<AuthSession>;

  /** Revokes an active session. False when it was already revoked (the first reason stays). */
  revoke(
    id: string,
    reason: SessionRevocationReason,
    now: Date,
  ): Promise<boolean>;

  /** Revokes every active session of the user for the audience; returns how many. */
  revokeAllOf(
    userId: string,
    audience: Audience,
    reason: SessionRevocationReason,
    now: Date,
  ): Promise<number>;

  /** Records that the session was just used (a refresh). */
  touch(id: string, now: Date): Promise<void>;
}

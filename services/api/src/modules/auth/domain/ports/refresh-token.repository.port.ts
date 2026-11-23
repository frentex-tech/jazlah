import type { AuthSession } from '../auth-session.entity';
import type { NewRefreshToken } from '../new-refresh-token.type';
import type { RefreshToken } from '../refresh-token.entity';

/** Injection token of the RefreshTokenRepository. */
export const REFRESH_TOKEN_REPOSITORY = Symbol('REFRESH_TOKEN_REPOSITORY');

/** Where refresh tokens are kept, by hash. */
export interface RefreshTokenRepository {
  create(token: NewRefreshToken): Promise<RefreshToken>;

  /** The token with this hash and the session it belongs to. */
  findByHash(
    tokenHash: string,
  ): Promise<Readonly<{ token: RefreshToken; session: AuthSession }> | null>;

  /**
   * Marks it exchanged, only if it was not already. False when it was: two requests
   * presented the same token, which is reuse.
   */
  markUsed(id: string, now: Date): Promise<boolean>;
}

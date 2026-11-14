import { Inject, Injectable } from '@nestjs/common';
import {
  AUTH_SESSION_REPOSITORY,
  type AuthSessionRepository,
} from '../domain/ports/auth-session.repository.port';
import { CLOCK, type Clock } from '../domain/ports/clock.port';
import {
  REFRESH_TOKEN_REPOSITORY,
  type RefreshTokenRepository,
} from '../domain/ports/refresh-token.repository.port';
import {
  REFRESH_TOKEN_SECRETS,
  type RefreshTokenSecrets,
} from '../domain/ports/refresh-token-secrets.port';

/**
 * Signs out of one session, named by any of its refresh tokens (used or expired ones
 * too), so it works when the access token has already expired. It answers the same
 * for an unknown token and for a session already ended: nothing can be learned from
 * it, and repeating it changes nothing.
 *
 * The session's access token keeps working until it expires
 * (AUTH_ACCESS_TOKEN_TTL_SECONDS): the guard does not read sessions (DECISIONS.md).
 */
@Injectable()
export class LogoutUseCase {
  constructor(
    @Inject(REFRESH_TOKEN_REPOSITORY)
    private readonly refreshTokens: RefreshTokenRepository,
    @Inject(AUTH_SESSION_REPOSITORY)
    private readonly sessions: AuthSessionRepository,
    @Inject(REFRESH_TOKEN_SECRETS)
    private readonly secrets: RefreshTokenSecrets,
    @Inject(CLOCK) private readonly clock: Clock,
  ) {}

  async execute(refreshToken: string): Promise<void> {
    const found = await this.refreshTokens.findByHash(
      this.secrets.hash(refreshToken),
    );
    if (found !== null) {
      await this.sessions.revoke(found.session.id, 'logout', this.clock.now());
    }
  }
}

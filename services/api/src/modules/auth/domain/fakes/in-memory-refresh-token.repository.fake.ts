import type { AuthSession } from '../auth-session.entity';
import type { NewRefreshToken } from '../new-refresh-token.type';
import type { RefreshTokenRepository } from '../ports/refresh-token.repository.port';
import { RefreshToken } from '../refresh-token.entity';
import type { InMemoryAuthSessionRepository } from './in-memory-auth-session.repository.fake';

/**
 * The refresh token repository in memory. It reads sessions from the in-memory session
 * repository it is given, as the real one joins the two tables.
 */
export class InMemoryRefreshTokenRepository implements RefreshTokenRepository {
  rows: RefreshToken[] = [];
  /**
   * When true, the next `markUsed` reports that another request exchanged the token
   * first, as a concurrent refresh would.
   */
  loseNextRace = false;
  private nextId = 1;

  constructor(private readonly sessions: InMemoryAuthSessionRepository) {}

  create(token: NewRefreshToken): Promise<RefreshToken> {
    const row = new RefreshToken(
      `refresh-${this.nextId++}`,
      token.sessionId,
      token.tokenHash,
      token.expiresAt,
      null,
    );
    this.rows.push(row);
    return Promise.resolve(row);
  }

  findByHash(
    tokenHash: string,
  ): Promise<Readonly<{ token: RefreshToken; session: AuthSession }> | null> {
    const token = this.rows.find((row) => row.tokenHash === tokenHash);
    const session =
      token === undefined ? undefined : this.sessions.byId(token.sessionId);
    return Promise.resolve(
      token === undefined || session === undefined ? null : { token, session },
    );
  }

  markUsed(id: string, now: Date): Promise<boolean> {
    const row = this.rows.find((each) => each.id === id);
    if (row === undefined || row.usedAt !== null || this.loseNextRace) {
      this.loseNextRace = false;
      return Promise.resolve(false);
    }
    const next = new RefreshToken(
      row.id,
      row.sessionId,
      row.tokenHash,
      row.expiresAt,
      now,
    );
    this.rows = this.rows.map((each) => (each.id === id ? next : each));
    return Promise.resolve(true);
  }
}

import type { Audience } from '@common/auth/audience.type';
import { AuthSession } from '../auth-session.entity';
import type { NewAuthSession } from '../new-auth-session.type';
import type { AuthSessionRepository } from '../ports/auth-session.repository.port';
import type { SessionRevocationReason } from '../session-revocation-reason.type';

/** The session repository in memory, with the same conditions as the real one. */
export class InMemoryAuthSessionRepository implements AuthSessionRepository {
  rows: AuthSession[] = [];
  private nextId = 1;

  create(session: NewAuthSession): Promise<AuthSession> {
    const row = new AuthSession(
      `session-${this.nextId++}`,
      session.userId,
      session.audience,
      session.organisationId,
      session.deviceName,
      session.devicePlatform,
      session.lastUsedAt,
      null,
      null,
    );
    this.rows.push(row);
    return Promise.resolve(row);
  }

  revoke(
    id: string,
    reason: SessionRevocationReason,
    now: Date,
  ): Promise<boolean> {
    const row = this.byId(id);
    if (row === undefined || !row.isActive) {
      return Promise.resolve(false);
    }
    this.replace(row, { revokedAt: now, revocationReason: reason });
    return Promise.resolve(true);
  }

  async revokeAllOf(
    userId: string,
    audience: Audience,
    reason: SessionRevocationReason,
    now: Date,
  ): Promise<number> {
    let count = 0;
    for (const row of this.rows) {
      if (
        row.userId === userId &&
        row.audience === audience &&
        (await this.revoke(row.id, reason, now))
      ) {
        count += 1;
      }
    }
    return count;
  }

  touch(id: string, now: Date): Promise<void> {
    const row = this.byId(id);
    if (row !== undefined) {
      this.replace(row, { lastUsedAt: now });
    }
    return Promise.resolve();
  }

  /** The stored session, as it is now. */
  byId(id: string): AuthSession | undefined {
    return this.rows.find((row) => row.id === id);
  }

  private replace(
    row: AuthSession,
    change: {
      lastUsedAt?: Date;
      revokedAt?: Date;
      revocationReason?: SessionRevocationReason;
    },
  ): void {
    const next = new AuthSession(
      row.id,
      row.userId,
      row.audience,
      row.organisationId,
      row.deviceName,
      row.devicePlatform,
      change.lastUsedAt ?? row.lastUsedAt,
      change.revokedAt ?? row.revokedAt,
      change.revocationReason ?? row.revocationReason,
    );
    this.rows = this.rows.map((each) => (each.id === row.id ? next : each));
  }
}

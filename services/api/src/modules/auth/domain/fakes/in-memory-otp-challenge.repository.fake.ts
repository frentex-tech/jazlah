import type { Audience } from '@common/auth/audience.type';
import type { NewOtpChallenge } from '../new-otp-challenge.type';
import { OtpChallenge } from '../otp-challenge.entity';
import type { OtpChallengeRepository } from '../ports/otp-challenge.repository.port';

/** The challenge repository in memory, with the same conditions as the real one. */
export class InMemoryOtpChallengeRepository implements OtpChallengeRepository {
  /** Every stored challenge, oldest first. */
  rows: OtpChallenge[] = [];
  /** When set, `delete` rejects with it. */
  deleteFailure: Error | undefined;
  private nextId = 1;

  create(challenge: NewOtpChallenge): Promise<OtpChallenge> {
    const row = new OtpChallenge(
      `challenge-${this.nextId++}`,
      challenge.phone,
      challenge.audience,
      challenge.codeHash,
      challenge.expiresAt,
      0,
      null,
      challenge.createdAt,
    );
    this.rows.push(row);
    return Promise.resolve(row);
  }

  findNewest(phone: string, audience: Audience): Promise<OtpChallenge | null> {
    const matching = this.rows.filter(
      (row) => row.phone === phone && row.audience === audience,
    );
    return Promise.resolve(matching.at(-1) ?? null);
  }

  claimAttempt(id: string, maxAttempts: number, now: Date): Promise<boolean> {
    const row = this.byId(id);
    if (row === undefined || row.state(now, maxAttempts) !== 'usable') {
      return Promise.resolve(false);
    }
    this.replace(row, { attempts: row.attempts + 1 });
    return Promise.resolve(true);
  }

  consume(id: string, now: Date): Promise<boolean> {
    const row = this.byId(id);
    if (row === undefined || row.consumedAt !== null) {
      return Promise.resolve(false);
    }
    this.replace(row, { consumedAt: now });
    return Promise.resolve(true);
  }

  delete(id: string): Promise<void> {
    if (this.deleteFailure !== undefined) {
      return Promise.reject(this.deleteFailure);
    }
    this.rows = this.rows.filter((row) => row.id !== id);
    return Promise.resolve();
  }

  makeUnverifiable(id: string, codeHash: string): Promise<void> {
    this.rows = this.rows.map((row) =>
      row.id === id
        ? new OtpChallenge(
            row.id,
            row.phone,
            row.audience,
            codeHash,
            row.expiresAt,
            row.attempts,
            row.consumedAt,
            row.createdAt,
          )
        : row,
    );
    return Promise.resolve();
  }

  /** The stored challenge, as it is now. */
  byId(id: string): OtpChallenge | undefined {
    return this.rows.find((row) => row.id === id);
  }

  private replace(
    row: OtpChallenge,
    change: { attempts?: number; consumedAt?: Date },
  ): void {
    const next = new OtpChallenge(
      row.id,
      row.phone,
      row.audience,
      row.codeHash,
      row.expiresAt,
      change.attempts ?? row.attempts,
      change.consumedAt ?? row.consumedAt,
      row.createdAt,
    );
    this.rows = this.rows.map((each) => (each.id === row.id ? next : each));
  }
}

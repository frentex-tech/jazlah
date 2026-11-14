import { Injectable } from '@nestjs/common';
import type { Audience } from '@common/auth/audience.type';
import { DbContext } from '@infra/database/db-context';
import { mapPrismaError } from '@infra/database/map-prisma-error';
import type { AuthSession } from '../domain/auth-session.entity';
import type { NewAuthSession } from '../domain/new-auth-session.type';
import type { AuthSessionRepository } from '../domain/ports/auth-session.repository.port';
import type { SessionRevocationReason } from '../domain/session-revocation-reason.type';
import { toAuthSession } from './auth-session.mapper';

/** The sessions in `auth_sessions`. A revocation is conditional: the first reason stays. */
@Injectable()
export class PrismaAuthSessionRepository implements AuthSessionRepository {
  constructor(private readonly db: DbContext) {}

  async create(session: NewAuthSession): Promise<AuthSession> {
    try {
      return toAuthSession(
        await this.db.client.authSession.create({ data: session }),
      );
    } catch (error) {
      mapPrismaError(error);
    }
  }

  async revoke(
    id: string,
    reason: SessionRevocationReason,
    now: Date,
  ): Promise<boolean> {
    try {
      const { count } = await this.db.client.authSession.updateMany({
        where: { id, revokedAt: null },
        data: { revokedAt: now, revocationReason: reason },
      });
      return count === 1;
    } catch (error) {
      mapPrismaError(error);
    }
  }

  async revokeAllOf(
    userId: string,
    audience: Audience,
    reason: SessionRevocationReason,
    now: Date,
  ): Promise<number> {
    try {
      const { count } = await this.db.client.authSession.updateMany({
        where: { userId, audience, revokedAt: null },
        data: { revokedAt: now, revocationReason: reason },
      });
      return count;
    } catch (error) {
      mapPrismaError(error);
    }
  }

  async touch(id: string, now: Date): Promise<void> {
    try {
      await this.db.client.authSession.updateMany({
        where: { id },
        data: { lastUsedAt: now },
      });
    } catch (error) {
      mapPrismaError(error);
    }
  }
}

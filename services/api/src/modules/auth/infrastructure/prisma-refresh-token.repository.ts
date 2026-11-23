import { Injectable } from '@nestjs/common';
import { DbContext } from '@infra/database/db-context';
import { mapPrismaError } from '@infra/database/map-prisma-error';
import type { AuthSession } from '../domain/auth-session.entity';
import type { NewRefreshToken } from '../domain/new-refresh-token.type';
import type { RefreshTokenRepository } from '../domain/ports/refresh-token.repository.port';
import type { RefreshToken } from '../domain/refresh-token.entity';
import { toAuthSession } from './auth-session.mapper';
import { toRefreshToken } from './refresh-token.mapper';

/** The refresh tokens in `refresh_tokens`, found by their hash. */
@Injectable()
export class PrismaRefreshTokenRepository implements RefreshTokenRepository {
  constructor(private readonly db: DbContext) {}

  async create(token: NewRefreshToken): Promise<RefreshToken> {
    try {
      return toRefreshToken(
        await this.db.client.refreshToken.create({ data: token }),
      );
    } catch (error) {
      mapPrismaError(error);
    }
  }

  async findByHash(
    tokenHash: string,
  ): Promise<Readonly<{ token: RefreshToken; session: AuthSession }> | null> {
    try {
      const row = await this.db.client.refreshToken.findUnique({
        where: { tokenHash },
        include: { session: true },
      });
      return row === null
        ? null
        : { token: toRefreshToken(row), session: toAuthSession(row.session) };
    } catch (error) {
      mapPrismaError(error);
    }
  }

  async markUsed(id: string, now: Date): Promise<boolean> {
    try {
      const { count } = await this.db.client.refreshToken.updateMany({
        where: { id, usedAt: null },
        data: { usedAt: now },
      });
      return count === 1;
    } catch (error) {
      mapPrismaError(error);
    }
  }
}

import type { RefreshToken as RefreshTokenRow } from '@infra/database/generated/prisma/client';
import { RefreshToken } from '../domain/refresh-token.entity';

/** A row of `refresh_tokens` as the domain's entity. */
export function toRefreshToken(row: RefreshTokenRow): RefreshToken {
  return new RefreshToken(
    row.id,
    row.sessionId,
    row.tokenHash,
    row.expiresAt,
    row.usedAt,
  );
}

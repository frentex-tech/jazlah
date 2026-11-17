import type { AuthSession as AuthSessionRow } from '@infra/database/generated/prisma/client';
import { AuthSession } from '../domain/auth-session.entity';

/** A row of `auth_sessions` as the domain's entity. */
export function toAuthSession(row: AuthSessionRow): AuthSession {
  return new AuthSession(
    row.id,
    row.userId,
    row.audience,
    row.organisationId,
    row.deviceName,
    row.devicePlatform,
    row.lastUsedAt,
    row.revokedAt,
    row.revocationReason,
    row.createdAt,
  );
}

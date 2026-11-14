import type { OtpChallenge as OtpChallengeRow } from '@infra/database/generated/prisma/client';
import { OtpChallenge } from '../domain/otp-challenge.entity';

/** A row of `otp_challenges` as the domain's entity. */
export function toOtpChallenge(row: OtpChallengeRow): OtpChallenge {
  return new OtpChallenge(
    row.id,
    row.phone,
    row.audience,
    row.codeHash,
    row.expiresAt,
    row.attempts,
    row.consumedAt,
    row.createdAt,
  );
}

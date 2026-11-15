import { Injectable } from '@nestjs/common';
import type { Audience } from '@common/auth/audience.type';
import { DbContext } from '@infra/database/db-context';
import { mapPrismaError } from '@infra/database/map-prisma-error';
import type { NewOtpChallenge } from '../domain/new-otp-challenge.type';
import type { OtpChallenge } from '../domain/otp-challenge.entity';
import type { OtpChallengeRepository } from '../domain/ports/otp-challenge.repository.port';
import { toOtpChallenge } from './otp-challenge.mapper';

/**
 * The verification challenges in `otp_challenges`. Each state change is one
 * conditional UPDATE: the database decides which of two racing requests wins.
 */
@Injectable()
export class PrismaOtpChallengeRepository implements OtpChallengeRepository {
  constructor(private readonly db: DbContext) {}

  async create(challenge: NewOtpChallenge): Promise<OtpChallenge> {
    try {
      return toOtpChallenge(
        await this.db.client.otpChallenge.create({ data: challenge }),
      );
    } catch (error) {
      mapPrismaError(error);
    }
  }

  async findNewest(
    phone: string,
    audience: Audience,
  ): Promise<OtpChallenge | null> {
    try {
      const row = await this.db.client.otpChallenge.findFirst({
        where: { phone, audience },
        // The id breaks a tie between two rows of the same millisecond, deterministically.
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      });
      return row === null ? null : toOtpChallenge(row);
    } catch (error) {
      mapPrismaError(error);
    }
  }

  async claimAttempt(
    id: string,
    maxAttempts: number,
    now: Date,
  ): Promise<boolean> {
    try {
      const { count } = await this.db.client.otpChallenge.updateMany({
        where: {
          id,
          consumedAt: null,
          attempts: { lt: maxAttempts },
          expiresAt: { gt: now },
        },
        data: { attempts: { increment: 1 } },
      });
      return count === 1;
    } catch (error) {
      mapPrismaError(error);
    }
  }

  async consume(id: string, now: Date): Promise<boolean> {
    try {
      const { count } = await this.db.client.otpChallenge.updateMany({
        where: { id, consumedAt: null },
        data: { consumedAt: now },
      });
      return count === 1;
    } catch (error) {
      mapPrismaError(error);
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.db.client.otpChallenge.deleteMany({ where: { id } });
    } catch (error) {
      mapPrismaError(error);
    }
  }

  async makeUnverifiable(id: string, codeHash: string): Promise<void> {
    try {
      await this.db.client.otpChallenge.updateMany({
        where: { id },
        data: { codeHash },
      });
    } catch (error) {
      mapPrismaError(error);
    }
  }
}

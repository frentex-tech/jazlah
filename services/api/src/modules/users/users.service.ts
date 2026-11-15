import { Injectable } from '@nestjs/common';
import { AppError } from '@common/errors/app-error';
import { ErrorCode } from '@common/errors/error-code.enum';
import { DbContext } from '@infra/database/db-context';
import type { User as UserRow } from '@infra/database/generated/prisma/client';
import { mapPrismaError } from '@infra/database/map-prisma-error';
import { TransactionRunner } from '@infra/database/transaction-runner';
import type { StaffAccess } from './staff-access.type';
import type { StaffAudience } from '@common/auth/staff-audience.type';
import type { User } from './user.type';

/**
 * The users (table `users`) and the staff access granted to them (table
 * `user_access`). A user is a phone number; anyone may be a customer, while vendor,
 * kitchen and admin access is granted, one per user per audience, and can be
 * deactivated. Signing in, sessions and tokens belong to the auth module, which reads
 * users only through this service.
 *
 * Phone numbers are E.164 here: callers normalise them first
 * (normalizeSaudiMobileNumber).
 */
@Injectable()
export class UsersService {
  constructor(
    private readonly db: DbContext,
    private readonly transactions: TransactionRunner,
  ) {}

  /**
   * The user with this phone, created if there is none. Safe when two requests create
   * the same user at once, and inside a transaction: the insert ignores a conflict
   * instead of failing (a failed query would end the transaction).
   */
  async findOrCreateByPhone(phone: string): Promise<User> {
    try {
      await this.db.client.user.createMany({
        data: [{ phone }],
        skipDuplicates: true,
      });
      const row = await this.db.client.user.findUnique({ where: { phone } });
      if (row === null) {
        throw new Error('The user disappeared right after it was created');
      }
      return this.toUser(row);
    } catch (error) {
      mapPrismaError(error);
    }
  }

  async findById(id: string): Promise<User | null> {
    try {
      const row = await this.db.client.user.findUnique({ where: { id } });
      return row === null ? null : this.toUser(row);
    } catch (error) {
      mapPrismaError(error);
    }
  }

  async findByPhone(phone: string): Promise<User | null> {
    try {
      const row = await this.db.client.user.findUnique({ where: { phone } });
      return row === null ? null : this.toUser(row);
    } catch (error) {
      mapPrismaError(error);
    }
  }

  /** The user's access for a staff audience, or null when none is active. */
  async findActiveAccess(
    userId: string,
    audience: StaffAudience,
  ): Promise<StaffAccess | null> {
    try {
      const row = await this.db.client.userAccess.findFirst({
        where: { userId, audience, deactivatedAt: null },
      });
      return row === null
        ? null
        : { userId, audience, organisationId: row.organisationId };
    } catch (error) {
      mapPrismaError(error);
    }
  }

  /**
   * Grants admin access to a phone, creating the user if needed, and reactivating an
   * access that was deactivated. Doing it again changes nothing.
   */
  async grantAdminAccess(phone: string): Promise<User> {
    return this.transactions.run(async () => {
      const user = await this.findOrCreateByPhone(phone);
      try {
        await this.db.client.userAccess.createMany({
          data: [{ userId: user.id, audience: 'admin' }],
          skipDuplicates: true,
        });
        await this.db.client.userAccess.updateMany({
          where: {
            userId: user.id,
            audience: 'admin',
            deactivatedAt: { not: null },
          },
          data: { deactivatedAt: null },
        });
      } catch (error) {
        mapPrismaError(error);
      }
      return user;
    });
  }

  /**
   * Grants vendor access for `vendorId` to an existing user: creates the access, or
   * reactivates a deactivated one and points it at this vendor. Granting it again
   * changes nothing. A user works for one vendor: an active access for another vendor is
   * refused with CONFLICT, and nothing changes.
   *
   * Database only, so it runs inside the caller's transaction (the approval of a vendor
   * application); the decision is one conditional update, safe beside a concurrent call.
   */
  async grantVendorAccess(userId: string, vendorId: string): Promise<void> {
    try {
      await this.db.client.userAccess.createMany({
        data: [{ userId, audience: 'vendor', organisationId: vendorId }],
        skipDuplicates: true,
      });
      const { count } = await this.db.client.userAccess.updateMany({
        where: {
          userId,
          audience: 'vendor',
          OR: [{ organisationId: vendorId }, { deactivatedAt: { not: null } }],
        },
        data: { organisationId: vendorId, deactivatedAt: null },
      });
      if (count === 0) {
        throw new AppError(ErrorCode.CONFLICT, {
          details: { reason: 'USER_WORKS_FOR_ANOTHER_VENDOR' },
        });
      }
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      mapPrismaError(error);
    }
  }

  private toUser(row: UserRow): User {
    return { id: row.id, phone: row.phone, disabledAt: row.disabledAt };
  }
}

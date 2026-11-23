import { Injectable } from '@nestjs/common';
import { AppError } from '@common/errors/app-error';
import { ErrorCode } from '@common/errors/error-code.enum';
import { DbContext } from '@infra/database/db-context';
import { mapPrismaError } from '@infra/database/map-prisma-error';
import { TransactionRunner } from '@infra/database/transaction-runner';
import type { StaffAccess } from './staff-access.type';
import type { StaffAudience } from '@common/auth/staff-audience.type';
import type { User } from './user.type';

/** The columns of a user row the service reads, whatever the query. */
type UserRow = Readonly<{
  id: string;
  phone: string | null;
  disabledAt: Date | null;
}>;

/**
 * The users (table `users`) and the staff access granted to them (table
 * `user_access`): the identity of every user, in every audience. A user is a phone
 * number; anyone may be a customer, while vendor, kitchen and admin access is granted,
 * one per user per audience, and can be deactivated. Signing in, sessions and tokens
 * belong to the auth module, and a customer's profile and addresses to the customers
 * module; both reach users only through this service.
 *
 * A deleted account is a tombstone: its row stays, with no phone and `deleted_at` set
 * (check constraint `users_deleted_check`), so the rows that name it keep a valid id
 * while the phone is free for a new user. Every read here leaves tombstones out: to the
 * rest of the API a deleted user does not exist.
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
   * instead of failing (a failed query would end the transaction). The phone of a
   * deleted account is free, so it gets a new user.
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

  /** The user with this id; null when there is none or the account was deleted. */
  async findById(id: string): Promise<User | null> {
    try {
      const row = await this.db.client.user.findFirst({
        where: { id, deletedAt: null },
      });
      return row === null ? null : this.toUser(row);
    } catch (error) {
      mapPrismaError(error);
    }
  }

  /** The user with this phone; null when there is none (a deleted account has no phone). */
  async findByPhone(phone: string): Promise<User | null> {
    try {
      const row = await this.db.client.user.findUnique({ where: { phone } });
      return row === null ? null : this.toUser(row);
    } catch (error) {
      mapPrismaError(error);
    }
  }

  /**
   * Locks the user's row for the rest of the transaction (`SELECT … FOR UPDATE`) and
   * returns the user; null when there is none or the account was deleted, and then
   * nothing is locked. The root lock of everything a user owns beyond their identity:
   * every write to a customer's profile, addresses or consent takes it first, and so does
   * deleting the account, so those writes and the deletion happen one after the other
   * (`modules.md`, "A write to an aggregate locks its root row first"). Call it inside a
   * transaction: outside one the lock ends with the statement.
   */
  async lockForWrite(id: string): Promise<User | null> {
    try {
      const rows = await this.db.client.$queryRaw<UserRow[]>`
        SELECT "id", "phone", "disabled_at" AS "disabledAt" FROM "users"
        WHERE "id" = ${id}::uuid AND "deleted_at" IS NULL
        FOR UPDATE`;
      const row = rows[0];
      return row === undefined ? null : this.toUser(row);
    } catch (error) {
      mapPrismaError(error);
    }
  }

  /**
   * Like lockForWrite, with a shared lock (`FOR SHARE`): many such holders at once, but
   * none while the account is being deleted. For writes that only need the user to keep
   * existing until they commit (a sign-in creating a session, an application naming its
   * applicant): if a deletion commits first, this answers null instead of letting the
   * write name a tombstone.
   */
  async lockForShare(id: string): Promise<User | null> {
    try {
      const rows = await this.db.client.$queryRaw<UserRow[]>`
        SELECT "id", "phone", "disabled_at" AS "disabledAt" FROM "users"
        WHERE "id" = ${id}::uuid AND "deleted_at" IS NULL
        FOR SHARE`;
      const row = rows[0];
      return row === undefined ? null : this.toUser(row);
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

  /** Whether the user holds any active staff access: vendor, kitchen or admin. */
  async hasActiveStaffAccess(userId: string): Promise<boolean> {
    try {
      return (
        (await this.db.client.userAccess.count({
          where: { userId, deactivatedAt: null },
        })) > 0
      );
    } catch (error) {
      mapPrismaError(error);
    }
  }

  /**
   * Makes the account a tombstone: removes the phone, which frees it for a new user, and
   * records when. False when the user does not exist or was already deleted. Database
   * only, inside the caller's transaction, after lockForWrite: the other personal data
   * (sessions, profile, addresses, applications) is removed by the account deletion,
   * which owns that order.
   */
  async markDeleted(id: string, at: Date): Promise<boolean> {
    try {
      const { count } = await this.db.client.user.updateMany({
        where: { id, deletedAt: null },
        data: { phone: null, deletedAt: at },
      });
      return count === 1;
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
   * refused with VENDOR_ACCESS_ALREADY_HELD, and nothing changes.
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
        throw new AppError(ErrorCode.VENDOR_ACCESS_ALREADY_HELD);
      }
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      mapPrismaError(error);
    }
  }

  private toUser(row: UserRow): User {
    if (row.phone === null) {
      // users_deleted_check: only a deleted account has no phone, and every read here
      // leaves deleted accounts out.
      throw new Error(`User ${row.id} has no phone but is not deleted`);
    }
    return { id: row.id, phone: row.phone, disabledAt: row.disabledAt };
  }
}

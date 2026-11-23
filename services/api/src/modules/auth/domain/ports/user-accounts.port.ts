import type { StaffAudience } from '@common/auth/staff-audience.type';
import type { UserAccount } from '../user-account.type';

/** Injection token of UserAccounts. */
export const USER_ACCOUNTS = Symbol('USER_ACCOUNTS');

/** What signing in needs to know about users; the users module owns them. */
export interface UserAccounts {
  /** The user with this phone, created if there is none (a first customer sign-in). */
  findOrCreateByPhone(phone: string): Promise<UserAccount>;
  /** Null when there is none; a deleted account has no phone. */
  findByPhone(phone: string): Promise<UserAccount | null>;
  /** Null when there is none or the account was deleted. */
  findById(id: string): Promise<UserAccount | null>;

  /**
   * Locks the user's row for the rest of the transaction and returns the user; null
   * when there is none or the account was deleted. Taken first by everything that
   * writes what a customer keeps, and by the account deletion.
   */
  lockForWrite(id: string): Promise<UserAccount | null>;

  /**
   * Holds the user's row (a shared lock) while a session is created for it, so a
   * deletion cannot commit in between; null when the account was deleted meanwhile.
   */
  lockForSignIn(id: string): Promise<UserAccount | null>;

  /** Whether the user holds any active vendor, kitchen or admin access. */
  hasActiveStaffAccess(id: string): Promise<boolean>;

  /**
   * Makes the account a tombstone: no phone (free for a new user), the deletion time
   * recorded. False when it was already deleted. After lockForWrite, in its transaction.
   */
  markDeleted(id: string, at: Date): Promise<boolean>;

  /**
   * The organisation of the user's active access for a staff audience (null for
   * admin), or `undefined` when the user has no active access for it.
   */
  findStaffOrganisation(
    userId: string,
    audience: StaffAudience,
  ): Promise<string | null | undefined>;
}

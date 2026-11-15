import type { StaffAudience } from '@common/auth/staff-audience.type';
import type { UserAccount } from '../user-account.type';

/** Injection token of UserAccounts. */
export const USER_ACCOUNTS = Symbol('USER_ACCOUNTS');

/** What signing in needs to know about users; the users module owns them. */
export interface UserAccounts {
  /** The user with this phone, created if there is none (a first customer sign-in). */
  findOrCreateByPhone(phone: string): Promise<UserAccount>;
  findByPhone(phone: string): Promise<UserAccount | null>;
  findById(id: string): Promise<UserAccount | null>;

  /**
   * The organisation of the user's active access for a staff audience (null for
   * admin), or `undefined` when the user has no active access for it.
   */
  findStaffOrganisation(
    userId: string,
    audience: StaffAudience,
  ): Promise<string | null | undefined>;
}

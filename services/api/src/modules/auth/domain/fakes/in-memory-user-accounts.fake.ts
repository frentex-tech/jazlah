import type { UserAccounts } from '../ports/user-accounts.port';
import type { StaffAudience } from '@common/auth/staff-audience.type';
import type { UserAccount } from '../user-account.type';

/**
 * Users and their staff access in memory, with helpers to arrange a test. A deleted
 * account leaves `users` and is remembered in `deleted` (id to time), as a tombstone
 * leaves every read.
 */
export class InMemoryUserAccounts implements UserAccounts {
  users: UserAccount[] = [];
  /** Active access: `<userId>:<audience>` to the organisation (null for admin). */
  readonly access = new Map<string, string | null>();
  /** Deleted accounts: id to the deletion time. */
  deleted = new Map<string, Date>();
  /** Each row lock taken, in order: `<write|sign-in> <id>`. */
  readonly locks: string[] = [];
  /** Runs once, just before the next lockForSignIn answers (a deletion racing a sign-in). */
  beforeNextSignInLock: (() => void) | null = null;
  private nextId = 1;

  findOrCreateByPhone(phone: string): Promise<UserAccount> {
    return Promise.resolve(this.byPhone(phone) ?? this.add(phone));
  }

  findByPhone(phone: string): Promise<UserAccount | null> {
    return Promise.resolve(this.byPhone(phone) ?? null);
  }

  findById(id: string): Promise<UserAccount | null> {
    return Promise.resolve(this.users.find((user) => user.id === id) ?? null);
  }

  lockForWrite(id: string): Promise<UserAccount | null> {
    this.locks.push(`write ${id}`);
    return this.findById(id);
  }

  lockForSignIn(id: string): Promise<UserAccount | null> {
    this.locks.push(`sign-in ${id}`);
    const before = this.beforeNextSignInLock;
    this.beforeNextSignInLock = null;
    before?.();
    return this.findById(id);
  }

  hasActiveStaffAccess(id: string): Promise<boolean> {
    return Promise.resolve(
      [...this.access.keys()].some((key) => key.startsWith(`${id}:`)),
    );
  }

  markDeleted(id: string, at: Date): Promise<boolean> {
    if (!this.users.some((user) => user.id === id)) {
      return Promise.resolve(false);
    }
    this.remove(id);
    this.deleted = new Map([...this.deleted, [id, at]]);
    return Promise.resolve(true);
  }

  findStaffOrganisation(
    userId: string,
    audience: StaffAudience,
  ): Promise<string | null | undefined> {
    return Promise.resolve(this.access.get(`${userId}:${audience}`));
  }

  /** Adds an enabled user. */
  add(phone: string): UserAccount {
    const user: UserAccount = {
      id: `user-${this.nextId++}`,
      phone,
      disabledAt: null,
    };
    this.users.push(user);
    return user;
  }

  /** Adds a user (if new) with active access for a staff audience. */
  grant(
    phone: string,
    audience: StaffAudience,
    organisationId: string | null,
  ): UserAccount {
    const user = this.byPhone(phone) ?? this.add(phone);
    this.access.set(`${user.id}:${audience}`, organisationId);
    return user;
  }

  /** Ends a user's access for a staff audience. */
  deactivate(userId: string, audience: StaffAudience): void {
    this.access.delete(`${userId}:${audience}`);
  }

  disable(userId: string, at: Date): void {
    this.users = this.users.map((user) =>
      user.id === userId ? { ...user, disabledAt: at } : user,
    );
  }

  remove(userId: string): void {
    this.users = this.users.filter((user) => user.id !== userId);
  }

  private byPhone(phone: string): UserAccount | undefined {
    return this.users.find((user) => user.phone === phone);
  }
}

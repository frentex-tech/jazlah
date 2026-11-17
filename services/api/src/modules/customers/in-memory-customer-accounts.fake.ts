import type { User } from '@modules/users';
import type { CustomerAccounts } from './customer-accounts.type';

/**
 * The users the customers services see, in memory: each test adds its customers, and
 * may delete or disable them. Records every row lock, so a test proves a write locked
 * first. Excluded from the build (`*.fake.ts`).
 */
export class InMemoryCustomerAccounts implements CustomerAccounts {
  private readonly users = new Map<string, User>();
  /** The user ids locked, in order. */
  readonly locked: string[] = [];

  add(id: string): User {
    const user: User = { id, phone: '+966512345678', disabledAt: null };
    this.users.set(id, user);
    return user;
  }

  delete(id: string): void {
    this.users.delete(id);
  }

  disable(id: string): void {
    const user = this.users.get(id);
    if (user !== undefined) {
      this.users.set(id, {
        ...user,
        disabledAt: new Date('2026-11-17T09:00:00.000Z'),
      });
    }
  }

  lockForWrite(id: string): Promise<User | null> {
    this.locked.push(id);
    return Promise.resolve(this.users.get(id) ?? null);
  }

  findById(id: string): Promise<User | null> {
    return Promise.resolve(this.users.get(id) ?? null);
  }
}

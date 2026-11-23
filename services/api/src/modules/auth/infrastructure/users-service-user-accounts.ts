import { Injectable } from '@nestjs/common';
import { UsersService } from '@modules/users';
import type { UserAccounts } from '../domain/ports/user-accounts.port';
import type { StaffAudience } from '@common/auth/staff-audience.type';
import type { UserAccount } from '../domain/user-account.type';

/** Users as signing in needs them, read through the users module's service. */
@Injectable()
export class UsersServiceUserAccounts implements UserAccounts {
  constructor(private readonly users: UsersService) {}

  findOrCreateByPhone(phone: string): Promise<UserAccount> {
    return this.users.findOrCreateByPhone(phone);
  }

  findByPhone(phone: string): Promise<UserAccount | null> {
    return this.users.findByPhone(phone);
  }

  findById(id: string): Promise<UserAccount | null> {
    return this.users.findById(id);
  }

  lockForWrite(id: string): Promise<UserAccount | null> {
    return this.users.lockForWrite(id);
  }

  lockForSignIn(id: string): Promise<UserAccount | null> {
    return this.users.lockForShare(id);
  }

  hasActiveStaffAccess(id: string): Promise<boolean> {
    return this.users.hasActiveStaffAccess(id);
  }

  markDeleted(id: string, at: Date): Promise<boolean> {
    return this.users.markDeleted(id, at);
  }

  async findStaffOrganisation(
    userId: string,
    audience: StaffAudience,
  ): Promise<string | null | undefined> {
    const access = await this.users.findActiveAccess(userId, audience);
    return access === null ? undefined : access.organisationId;
  }
}

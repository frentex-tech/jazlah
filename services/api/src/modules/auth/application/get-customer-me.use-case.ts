import { Inject, Injectable } from '@nestjs/common';
import type { AuthenticatedUser } from '@common/auth/authenticated-user.type';
import { AppError } from '@common/errors/app-error';
import { ErrorCode } from '@common/errors/error-code.enum';
import {
  CUSTOMER_PROFILES,
  type CustomerProfiles,
} from '../domain/ports/customer-profiles.port';
import {
  USER_ACCOUNTS,
  type UserAccounts,
} from '../domain/ports/user-accounts.port';
import type { CustomerMe } from './customer-me.type';

/**
 * The signed-in customer (`GET /v1/customer/me`): what the access token says, the phone,
 * and the profile with whether it is complete, so the app can offer the completion
 * screen after sign-in. Like GetCurrentUserUseCase it reads the user: a disabled user is
 * ACCOUNT_DISABLED, a deleted one (whose access token outlives the deletion) UNAUTHORIZED.
 */
@Injectable()
export class GetCustomerMeUseCase {
  constructor(
    @Inject(USER_ACCOUNTS) private readonly users: UserAccounts,
    @Inject(CUSTOMER_PROFILES) private readonly profiles: CustomerProfiles,
  ) {}

  async execute(user: AuthenticatedUser): Promise<CustomerMe> {
    const account = await this.users.findById(user.userId);
    if (account === null) {
      throw new AppError(ErrorCode.UNAUTHORIZED);
    }
    if (account.disabledAt !== null) {
      throw new AppError(ErrorCode.ACCOUNT_DISABLED);
    }
    return {
      ...user,
      phone: account.phone,
      profile: await this.profiles.summaryOf(account.id),
    };
  }
}

import { Inject, Injectable } from '@nestjs/common';
import type { AuthenticatedUser } from '@common/auth/authenticated-user.type';
import { AppError } from '@common/errors/app-error';
import { ErrorCode } from '@common/errors/error-code.enum';
import {
  USER_ACCOUNTS,
  type UserAccounts,
} from '../domain/ports/user-accounts.port';
import type { CurrentUserProfile } from './current-user-profile.type';

/**
 * Who is signed in: what the access token says, plus the user's phone. Unlike the
 * guard it reads the user, so a disabled user learns it here at once
 * (ACCOUNT_DISABLED), and a user who no longer exists is UNAUTHORIZED.
 */
@Injectable()
export class GetCurrentUserUseCase {
  constructor(@Inject(USER_ACCOUNTS) private readonly users: UserAccounts) {}

  async execute(user: AuthenticatedUser): Promise<CurrentUserProfile> {
    const account = await this.users.findById(user.userId);
    if (account === null) {
      throw new AppError(ErrorCode.UNAUTHORIZED);
    }
    if (account.disabledAt !== null) {
      throw new AppError(ErrorCode.ACCOUNT_DISABLED);
    }
    return { ...user, phone: account.phone };
  }
}

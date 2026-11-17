import { AppError } from '@common/errors/app-error';
import { ErrorCode } from '@common/errors/error-code.enum';
import type { User } from '@modules/users';

/**
 * The user, when a customer may act: UNAUTHORIZED for no user (none, or a deleted
 * account, whose access token may still be valid for a few minutes), ACCOUNT_DISABLED
 * for a disabled one.
 */
export function assertUsableCustomer(user: User | null): User {
  if (user === null) {
    throw new AppError(ErrorCode.UNAUTHORIZED);
  }
  if (user.disabledAt !== null) {
    throw new AppError(ErrorCode.ACCOUNT_DISABLED);
  }
  return user;
}

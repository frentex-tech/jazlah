import type { AuthenticatedUser } from '@common/auth/authenticated-user.type';
import type { AccountDeletionReason } from '../domain/account-deletion-reason.type';

/** Who asks to delete their account, from which session, and why (optional). */
export type DeleteCustomerAccountInput = Readonly<{
  principal: AuthenticatedUser;
  reason: AccountDeletionReason | null;
}>;

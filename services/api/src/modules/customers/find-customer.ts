import type { User } from '@modules/users';
import { assertUsableCustomer } from './assert-usable-customer';
import type { CustomerAccounts } from './customer-accounts.type';

/** The customer, for a read: nothing is locked; refuses as assertUsableCustomer. */
export async function findCustomer(
  accounts: CustomerAccounts,
  userId: string,
): Promise<User> {
  return assertUsableCustomer(await accounts.findById(userId));
}

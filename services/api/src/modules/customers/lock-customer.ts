import type { User } from '@modules/users';
import { assertUsableCustomer } from './assert-usable-customer';
import type { CustomerAccounts } from './customer-accounts.type';

/**
 * Locks the customer's user row for the rest of the caller's transaction, the first step
 * of every write to a profile, an address or the consent: writes of one customer then
 * happen one after the other, and none after the account was deleted (`modules.md`, "A
 * write to an aggregate locks its root row first"). Refuses as assertUsableCustomer.
 */
export async function lockCustomer(
  accounts: CustomerAccounts,
  userId: string,
): Promise<User> {
  return assertUsableCustomer(await accounts.lockForWrite(userId));
}

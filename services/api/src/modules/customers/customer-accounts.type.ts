import type { UsersService } from '@modules/users';

/**
 * What the customers module needs of the users module: the user's row lock (the root of
 * everything a customer keeps) and the user. Narrowed so a unit test passes a fake.
 */
export type CustomerAccounts = Pick<UsersService, 'lockForWrite' | 'findById'>;

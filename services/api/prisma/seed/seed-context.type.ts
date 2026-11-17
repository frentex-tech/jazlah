import type { EncryptionKey } from '@common/crypto/encryption-key.type';
import type { DbContext } from '@infra/database/db-context';
import type { TransactionRunner } from '@infra/database/transaction-runner';
import type { StorageService } from '@integrations/storage';
import type { UsersService } from '@modules/users';
import type { SeedTally } from './seed-tally';

/**
 * What every step of the seed works with, taken from the application context the seed
 * starts (SeedModule): the database client and transactions, the storage integration,
 * the users service (users and staff access as the API makes them), the IBAN key, and
 * the tally of what was done.
 */
export type SeedContext = Readonly<{
  db: DbContext;
  transactions: TransactionRunner;
  storage: StorageService;
  users: UsersService;
  ibanKey: EncryptionKey;
  tally: SeedTally;
}>;

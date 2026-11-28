import type { DbContext } from '@infra/database/db-context';
import type { GeoPoint } from '@infra/database/geo-point.type';
import { CustomerAddressesService } from './customer-addresses.service';
import { CustomerProfilesService } from './customer-profiles.service';
import { InMemoryCustomerAccounts } from './in-memory-customer-accounts.fake';
import { InMemoryCustomersClient } from './in-memory-customers-client.fake';
import { MarketingConsentsService } from './marketing-consents.service';

/** A customer of the tests, and another one. */
export const CUSTOMER = '00000000-0000-4000-8000-0000000000c1';
export const OTHER_CUSTOMER = '00000000-0000-4000-8000-0000000000c2';

/**
 * The three customers services on the in-memory client and accounts, for their unit
 * tests: no database, no Nest application. Both customers exist and are enabled.
 * `asDb` wraps the client as the services' DbContext: a spec does it, where a partial
 * double may be asserted (R21). Coverage stands in for CoverageService: a point is
 * covered north of latitude 24.
 */
export function buildCustomersKit(
  asDb: (client: InMemoryCustomersClient) => DbContext,
) {
  const client = new InMemoryCustomersClient();
  const accounts = new InMemoryCustomerAccounts();
  accounts.add(CUSTOMER);
  accounts.add(OTHER_CUSTOMER);
  const db = asDb(client);
  const transactions = {
    run: <T>(work: () => Promise<T>): Promise<T> => work(),
  };
  const coverage = {
    isCovered: (point: GeoPoint): Promise<boolean> =>
      Promise.resolve(point.latitude > 24),
  };
  const lockedAddressIds = new Set<string>();
  const orderAddressUsage = {
    isLocked: (userId: string, addressId: string): Promise<boolean> =>
      Promise.resolve(userId.length > 0 && lockedAddressIds.has(addressId)),
  };
  return {
    client,
    accounts,
    profiles: new CustomerProfilesService(db, accounts, transactions),
    consents: new MarketingConsentsService(db, accounts, transactions),
    addresses: new CustomerAddressesService(
      db,
      accounts,
      transactions,
      coverage,
      orderAddressUsage,
    ),
    lockedAddressIds,
    orderAddressUsage,
  };
}

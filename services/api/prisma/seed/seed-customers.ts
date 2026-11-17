import { SEED_CUSTOMERS } from './data/customers.constants';
import type { SeedCustomer } from './data/seed-customer.type';
import { pickId } from './pick-id';
import type { SeedContext } from './seed-context.type';
import { seedTime } from './seed-time';

/**
 * Each seeded customer's profile, saved addresses and marketing consent history, in one
 * transaction per customer, under the lock on the user's row (UsersService.lockForWrite,
 * as the customers module writes). Each part is written only when the customer has none of it
 * yet (no profile, no address, no consent record), so what a developer changed through
 * the app stays, the limit of ten addresses and the one default hold, and the
 * insert-only consent history is never touched once it exists.
 */
export async function seedCustomers(
  context: SeedContext,
  users: ReadonlyMap<string, string>,
): Promise<void> {
  for (const [index, customer] of SEED_CUSTOMERS.entries()) {
    await seedCustomer(
      context,
      customer,
      index,
      pickId(users, customer.user, 'user'),
    );
  }
}

async function seedCustomer(
  context: SeedContext,
  customer: SeedCustomer,
  index: number,
  userId: string,
): Promise<void> {
  const { db, transactions, tally } = context;
  const base = 120 + index * 10;
  const done = await transactions.run(async () => {
    // The root lock of a customer's data, as the customers module takes it.
    if ((await context.users.lockForWrite(userId)) === null) {
      throw new Error(
        `Seed customer ${customer.user} was deleted during the seed`,
      );
    }
    const profile = await db.client.customerProfile.createMany({
      data: [
        {
          userId,
          fullName: customer.fullName,
          email: customer.email,
          preferredLanguage: customer.preferredLanguage,
          createdAt: seedTime(base),
        },
      ],
      skipDuplicates: true,
    });

    const hasAddresses =
      (await db.client.customerAddress.count({ where: { userId } })) > 0;
    if (!hasAddresses && customer.addresses.length > 0) {
      await db.client.customerAddress.createMany({
        data: customer.addresses.map((address, position) => ({
          userId,
          ...address,
          createdAt: seedTime(base + 1 + position),
        })),
      });
    }

    const hasConsents =
      (await db.client.consentRecord.count({
        where: { userId, kind: 'marketing' },
      })) > 0;
    if (!hasConsents && customer.marketingConsents.length > 0) {
      await db.client.consentRecord.createMany({
        data: customer.marketingConsents.map((granted, position) => ({
          userId,
          kind: 'marketing',
          granted,
          sequence: position + 1,
          source: 'customer',
          createdAt: seedTime(base + 5 + position),
        })),
      });
    }
    return {
      profile: profile.count === 1,
      addresses: hasAddresses ? 0 : customer.addresses.length,
      consents: hasConsents ? 0 : customer.marketingConsents.length,
    };
  });
  tally.one('customer profiles', done.profile);
  tally.add(
    'customer addresses',
    done.addresses,
    customer.addresses.length - done.addresses,
  );
  tally.add(
    'consent records',
    done.consents,
    customer.marketingConsents.length - done.consents,
  );
}

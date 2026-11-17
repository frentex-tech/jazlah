import { normalizeSaudiMobileNumber } from '@common/phone/normalize-saudi-mobile-number';
import { SEED_USERS } from './data/users.constants';
import type { SeedContext } from './seed-context.type';

/**
 * Every seeded person (SEED_USERS) as a user, found by phone or created as the API
 * creates one (UsersService.findOrCreateByPhone): a phone that already signed in keeps
 * its user and everything it has. Returns the user id of each SeedUser key.
 */
export async function ensureUsers(
  context: SeedContext,
): Promise<ReadonlyMap<string, string>> {
  const ids = new Map<string, string>();
  for (const user of SEED_USERS) {
    const phone = normalizeSaudiMobileNumber(user.phone);
    if (phone === null) {
      throw new Error(`Seed user ${user.key} has no Saudi mobile number`);
    }
    const found = await context.users.findByPhone(phone);
    const row = found ?? (await context.users.findOrCreateByPhone(phone));
    context.tally.one('users', found === null);
    ids.set(user.key, row.id);
  }
  return ids;
}

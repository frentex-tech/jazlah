import { pickId } from './pick-id';
import type { SeedContext } from './seed-context.type';

/**
 * The all-panels development account (staging review: one phone that opens every staff
 * panel): admin as `pnpm admin:create` grants it, vendor for Al Nokhba Butchery (the
 * development vendor's store) and kitchen for the platform vendor. Accesses already
 * there are left as they are.
 */
export async function grantAllPanelsAccess(
  context: SeedContext,
  users: ReadonlyMap<string, string>,
  vendorIds: ReadonlyMap<string, string>,
): Promise<void> {
  const { db, tally } = context;
  const userId = pickId(users, 'dev-all-panels', 'user');
  const user = await context.users.findById(userId);
  if (user === null) {
    throw new Error(
      'The all-panels development account disappeared during the seed',
    );
  }
  const hadAdmin = await db.client.userAccess.findUnique({
    where: { userId_audience: { userId, audience: 'admin' } },
    select: { id: true },
  });
  await context.users.grantAdminAccess(user.phone);
  tally.one('staff access', hadAdmin === null);
  const { count } = await db.client.userAccess.createMany({
    data: [
      {
        userId,
        audience: 'vendor',
        organisationId: pickId(vendorIds, 'nokhba', 'vendor'),
      },
      {
        userId,
        audience: 'kitchen',
        organisationId: pickId(vendorIds, 'platform', 'vendor'),
      },
    ],
    skipDuplicates: true,
  });
  tally.add('staff access', count, 2 - count);
}

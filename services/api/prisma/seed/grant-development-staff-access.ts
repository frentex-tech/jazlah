import { pickId } from './pick-id';
import type { SeedContext } from './seed-context.type';

/**
 * Staff access of the admin and kitchen development accounts (the vendor account gets
 * its access with its vendor, seedVendors): admin as `pnpm admin:create` grants it
 * (UsersService.grantAdminAccess, which also reactivates it), kitchen for the platform
 * vendor, since a kitchen access points at a vendor until kitchens exist (DECISIONS.md,
 * Vendors). A kitchen access already there is left as it is, and named in the summary
 * when it is not the expected one.
 */
export async function grantDevelopmentStaffAccess(
  context: SeedContext,
  users: ReadonlyMap<string, string>,
  platformVendorId: string,
): Promise<void> {
  const { db, tally } = context;
  const adminId = pickId(users, 'dev-admin', 'user');
  const admin = await context.users.findById(adminId);
  if (admin === null) {
    throw new Error('The development admin disappeared during the seed');
  }
  const hadAdmin = await db.client.userAccess.findUnique({
    where: { userId_audience: { userId: adminId, audience: 'admin' } },
    select: { id: true },
  });
  await context.users.grantAdminAccess(admin.phone);
  tally.one('staff access', hadAdmin === null);

  const kitchenId = pickId(users, 'dev-kitchen', 'user');
  const { count } = await db.client.userAccess.createMany({
    data: [
      {
        userId: kitchenId,
        audience: 'kitchen',
        organisationId: platformVendorId,
      },
    ],
    skipDuplicates: true,
  });
  tally.one('staff access', count === 1);
  if (count === 0) {
    const kitchen = await db.client.userAccess.findUnique({
      where: { userId_audience: { userId: kitchenId, audience: 'kitchen' } },
    });
    if (
      kitchen !== null &&
      (kitchen.organisationId !== platformVendorId ||
        kitchen.deactivatedAt !== null)
    ) {
      tally.note(
        'the kitchen development account already had a kitchen access that is deactivated or for another vendor; it was left as it is',
      );
    }
  }
}

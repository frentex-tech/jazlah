import type { CreatePlatformVendorUseCase } from '@modules/vendors';
import { SEED_PARTNER_VENDORS } from './data/partner-vendors.constants';
import { SEED_VENDOR_APPLICATIONS } from './data/vendor-applications.constants';
import { ensureUsers } from './ensure-users';
import { grantDevelopmentStaffAccess } from './grant-development-staff-access';
import { pickId } from './pick-id';
import type { SeedContext } from './seed-context.type';
import { seedCustomers } from './seed-customers';
import { seedProducts } from './seed-products';
import { seedReferenceLists } from './seed-reference-lists';
import { seedVendors } from './seed-vendors';

/**
 * The whole development seed, in dependency order: the platform vendor (exactly as
 * `pnpm vendor:create-platform` creates it, through its use case), the users, the
 * admin and kitchen access, the admin lists, the applications and partner vendors, the
 * products, the customers. Every step creates only what is missing and never updates
 * or deletes a row, so running it again changes nothing.
 */
export async function seedDevelopmentData(
  context: SeedContext,
  platformVendor: Pick<CreatePlatformVendorUseCase, 'execute'>,
): Promise<void> {
  const platform = await platformVendor.execute();
  context.tally.one('platform vendor', platform.created);

  const users = await ensureUsers(context);
  const adminId = pickId(users, 'dev-admin', 'user');
  await grantDevelopmentStaffAccess(context, users, platform.vendor.id);
  await seedReferenceLists(context);

  const partners = await seedVendors(context, users, adminId);
  const vendorIds = new Map([['platform', platform.vendor.id], ...partners]);
  const ownerIds = new Map([
    // The platform's images and products are the admins' work.
    ['platform', adminId],
    ...SEED_PARTNER_VENDORS.map((vendor): [string, string] => {
      const application = SEED_VENDOR_APPLICATIONS.find(
        (candidate) => candidate.key === vendor.application,
      );
      if (application === undefined) {
        throw new Error(`Seed vendor ${vendor.key} has no application`);
      }
      return [vendor.key, pickId(users, application.applicant, 'user')];
    }),
  ]);
  await seedProducts(context, vendorIds, ownerIds, adminId);
  await seedCustomers(context, users);
}

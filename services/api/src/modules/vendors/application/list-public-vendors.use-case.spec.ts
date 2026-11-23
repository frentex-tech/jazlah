import { buildVendorsUseCases } from './vendors-use-cases.fake';
import { ADMIN, submitted } from './vendors-test-data.fake';

describe('ListPublicVendorsUseCase', () => {
  it('lists only active vendors, newest first', async () => {
    const kit = buildVendorsUseCases();
    const platform = (await kit.createPlatformVendor.execute()).vendor;
    const application = await submitted(kit);
    const vendor = await kit.approveApplication.execute({
      applicationId: application.id,
      reviewerId: ADMIN,
      commissionBasisPoints: 1000,
    });

    const before = await kit.listPublicVendors.execute({
      cursor: null,
      limit: 20,
    });
    await kit.suspendVendor.execute({
      vendorId: vendor.id,
      actorId: ADMIN,
      reason: 'r',
    });
    const after = await kit.listPublicVendors.execute({
      cursor: null,
      limit: 20,
    });

    expect(before.items.map((item) => item.vendor.id)).toEqual([
      vendor.id,
      platform.id,
    ]);
    expect(after.items.map((item) => item.vendor.id)).toEqual([platform.id]);
  });
});

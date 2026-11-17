import { buildVendorsUseCases } from './vendors-use-cases.fake';
import { ADMIN, APPLICANT, submitted } from './vendors-test-data.fake';

describe('ListVendorsUseCase', () => {
  it('lists every vendor, by status, with logo URLs read once per page', async () => {
    const kit = buildVendorsUseCases();
    const platform = (await kit.createPlatformVendor.execute()).vendor;
    const application = await submitted(kit);
    const vendor = await kit.approveApplication.execute({
      applicationId: application.id,
      reviewerId: ADMIN,
      commissionBasisPoints: 1000,
    });
    const logo = '00000000-0000-4000-8000-0000000000e1';
    kit.media.add({
      id: logo,
      ownerId: APPLICANT,
      purpose: 'vendor.logo',
      isReady: true,
    });
    await kit.vendors.updateProfile(vendor.id, { logoMediaId: logo });
    await kit.suspendVendor.execute({
      vendorId: vendor.id,
      actorId: ADMIN,
      reason: 'r',
    });
    kit.media.publicUrlCalls = 0;

    const all = await kit.listVendors.execute({}, { cursor: null, limit: 20 });
    const suspended = await kit.listVendors.execute(
      { status: 'suspended' },
      { cursor: null, limit: 20 },
    );

    expect(all.items.map((item) => [item.vendor.id, item.logoUrl])).toEqual([
      [vendor.id, `https://cdn.example.invalid/${logo}`],
      [platform.id, null],
    ]);
    expect(suspended.items.map((item) => item.vendor.id)).toEqual([vendor.id]);
    expect(kit.media.publicUrlCalls).toBe(2);
  });

  it('narrows by search (either name, any case, or the CR number) and by city', async () => {
    const kit = buildVendorsUseCases();
    await kit.createPlatformVendor.execute();
    const application = await submitted(kit);
    const vendor = await kit.approveApplication.execute({
      applicationId: application.id,
      reviewerId: ADMIN,
      commissionBasisPoints: 1000,
    });
    const page = { cursor: null, limit: 20 };
    const ids = async (filter: Parameters<typeof kit.listVendors.execute>[0]) =>
      (await kit.listVendors.execute(filter, page)).items.map(
        (item) => item.vendor.id,
      );

    expect(await ids({ q: 'النخبة' })).toEqual([vendor.id]);
    expect(await ids({ q: 'nokhba' })).toEqual([vendor.id]);
    expect(await ids({ q: '0123' })).toEqual([vendor.id]);
    expect(await ids({ q: 'unknown' })).toEqual([]);
    expect(await ids({ city: 'الرياض' })).toEqual([vendor.id]);
    expect(await ids({ city: 'جدة' })).toEqual([]);
    expect(await ids({ q: 'nokhba', status: 'suspended' })).toEqual([]);
  });
});

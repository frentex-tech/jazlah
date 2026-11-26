import { VendorDirectory } from './vendor-directory.service';
import { buildVendorsUseCases } from './vendors-use-cases.fake';
import { ADMIN, submitted } from './vendors-test-data.fake';

describe('VendorDirectory', () => {
  it('finds the platform vendor, null before it exists', async () => {
    const kit = buildVendorsUseCases();
    const directory = new VendorDirectory(kit.vendors);

    expect(await directory.platformVendorId()).toBeNull();
    const { vendor } = await kit.createPlatformVendor.execute();
    expect(await directory.platformVendorId()).toBe(vendor.id);
  });

  it('gives names by id, leaving unknown ids out', async () => {
    const kit = buildVendorsUseCases();
    const directory = new VendorDirectory(kit.vendors);
    const application = await submitted(kit);
    const vendor = await kit.approveApplication.execute({
      applicationId: application.id,
      reviewerId: ADMIN,
      commissionBasisPoints: 1000,
    });
    const unknown = '00000000-0000-4000-8000-0000000000ff';

    const names = await directory.namesOf([vendor.id, vendor.id, unknown]);

    expect([...names.entries()]).toEqual([[vendor.id, vendor.name]]);
  });

  it('gives the store a customer collects from, null for an unknown id', async () => {
    const kit = buildVendorsUseCases();
    const directory = new VendorDirectory(kit.vendors);
    const application = await submitted(kit);
    const vendor = await kit.approveApplication.execute({
      applicationId: application.id,
      reviewerId: ADMIN,
      commissionBasisPoints: 1000,
    });

    expect(await directory.storeOf(vendor.id)).toEqual({
      id: vendor.id,
      name: vendor.name,
      city: vendor.city,
      location: vendor.location,
      contactPhone: vendor.contactPhone,
    });
    expect(
      await directory.storeOf('00000000-0000-4000-8000-0000000000ff'),
    ).toBeNull();
  });
});

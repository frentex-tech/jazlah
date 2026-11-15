import { buildVendorsUseCases } from './vendors-use-cases.fake';

describe('CreatePlatformVendorUseCase', () => {
  it('creates the platform vendor with no business details, its first commission entry and an audit entry by the system', async () => {
    const kit = buildVendorsUseCases();

    const { vendor, created } = await kit.createPlatformVendor.execute();

    expect(created).toBe(true);
    expect(vendor).toMatchObject({
      isPlatform: true,
      status: 'active',
      name: { ar: 'جزلة', en: 'JAZLA' },
      commissionBasisPoints: 0,
      commercialRegistrationNumber: null,
      ibanLast4: null,
      applicationId: null,
    });
    expect(kit.history.rows).toEqual([
      expect.objectContaining({
        vendorId: vendor.id,
        commissionBasisPoints: 0,
        previousCommissionBasisPoints: null,
        changedById: null,
      }),
    ]);
    expect(kit.audit.rows).toEqual([
      {
        actorId: null,
        action: 'vendors.vendor.created',
        entity: 'vendor',
        entityId: vendor.id,
      },
    ]);
  });

  it('is idempotent: run again, it returns the same vendor and writes nothing', async () => {
    const kit = buildVendorsUseCases();
    const first = await kit.createPlatformVendor.execute();

    const second = await kit.createPlatformVendor.execute();

    expect(second).toEqual({ vendor: first.vendor, created: false });
    expect(kit.vendors.rows).toHaveLength(1);
    expect(kit.history.rows).toHaveLength(1);
    expect(kit.audit.rows).toHaveLength(1);
  });
});

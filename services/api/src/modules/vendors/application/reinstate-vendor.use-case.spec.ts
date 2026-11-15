import { ErrorCode } from '@common/errors/error-code.enum';
import { buildVendorsUseCases } from './vendors-use-cases.fake';
import { ADMIN, submitted } from './vendors-test-data.fake';

describe('ReinstateVendorUseCase', () => {
  async function suspendedVendor() {
    const kit = buildVendorsUseCases();
    const application = await submitted(kit);
    const vendor = await kit.approveApplication.execute({
      applicationId: application.id,
      reviewerId: ADMIN,
      commissionBasisPoints: 1000,
    });
    await kit.suspendVendor.execute({
      vendorId: vendor.id,
      actorId: ADMIN,
      reason: 'r',
    });
    return { kit, vendor };
  }

  it('reinstates a suspended vendor, clearing the suspension, and audits it', async () => {
    const { kit, vendor } = await suspendedVendor();

    const result = await kit.reinstateVendor.execute({
      vendorId: vendor.id,
      actorId: ADMIN,
    });

    expect(result.vendor).toMatchObject({
      status: 'active',
      suspendedAt: null,
      suspensionReason: null,
    });
    expect(kit.audit.rows.at(-1)).toEqual({
      actorId: ADMIN,
      action: 'vendors.vendor.reinstated',
      entity: 'vendor',
      entityId: vendor.id,
    });
  });

  it('refuses an active vendor with CONFLICT VENDOR_NOT_SUSPENDED, and an unknown one with NOT_FOUND', async () => {
    const { kit, vendor } = await suspendedVendor();
    await kit.reinstateVendor.execute({ vendorId: vendor.id, actorId: ADMIN });

    await expect(
      kit.reinstateVendor.execute({ vendorId: vendor.id, actorId: ADMIN }),
    ).rejects.toMatchObject({
      code: ErrorCode.CONFLICT,
      details: { reason: 'VENDOR_NOT_SUSPENDED' },
    });
    await expect(
      kit.reinstateVendor.execute({
        vendorId: '00000000-0000-4000-8000-0000000000ff',
        actorId: ADMIN,
      }),
    ).rejects.toMatchObject({ code: ErrorCode.NOT_FOUND });
  });
});

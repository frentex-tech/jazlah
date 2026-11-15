import { ErrorCode } from '@common/errors/error-code.enum';
import type { Vendor } from '../domain/vendor.entity';
import {
  buildVendorsUseCases,
  type VendorsKit,
} from './vendors-use-cases.fake';
import { ADMIN, submitted } from './vendors-test-data.fake';

async function approvedVendor(kit: VendorsKit): Promise<Vendor> {
  const application = await submitted(kit);
  return kit.approveApplication.execute({
    applicationId: application.id,
    reviewerId: ADMIN,
    commissionBasisPoints: 1000,
  });
}

describe('SuspendVendorUseCase', () => {
  it('suspends an active vendor with the reason and audits it', async () => {
    const kit = buildVendorsUseCases();
    const vendor = await approvedVendor(kit);

    const result = await kit.suspendVendor.execute({
      vendorId: vendor.id,
      actorId: ADMIN,
      reason: 'شكاوى متكررة',
    });

    expect(result.vendor).toMatchObject({
      status: 'suspended',
      suspensionReason: 'شكاوى متكررة',
    });
    expect(result.vendor.suspendedAt).not.toBeNull();
    expect(kit.audit.rows.at(-1)).toEqual({
      actorId: ADMIN,
      action: 'vendors.vendor.suspended',
      entity: 'vendor',
      entityId: vendor.id,
    });
  });

  it('refuses a vendor already suspended with CONFLICT VENDOR_ALREADY_SUSPENDED, auditing once', async () => {
    const kit = buildVendorsUseCases();
    const vendor = await approvedVendor(kit);
    const input = { vendorId: vendor.id, actorId: ADMIN, reason: 'r' };
    await kit.suspendVendor.execute(input);
    const audited = kit.audit.rows.length;

    await expect(kit.suspendVendor.execute(input)).rejects.toMatchObject({
      code: ErrorCode.CONFLICT,
      details: { reason: 'VENDOR_ALREADY_SUSPENDED' },
    });
    expect(kit.audit.rows).toHaveLength(audited);
  });

  it('refuses the same way when another suspension wins after the read', async () => {
    const kit = buildVendorsUseCases();
    const vendor = await approvedVendor(kit);
    const findById = kit.vendors.findById.bind(kit.vendors);
    jest.spyOn(kit.vendors, 'findById').mockImplementationOnce(async (id) => {
      const found = await findById(id);
      await kit.vendors.suspend(id, 'first');
      return found;
    });

    await expect(
      kit.suspendVendor.execute({
        vendorId: vendor.id,
        actorId: ADMIN,
        reason: 'second',
      }),
    ).rejects.toMatchObject({
      code: ErrorCode.CONFLICT,
      details: { reason: 'VENDOR_ALREADY_SUSPENDED' },
    });
  });

  it('refuses an unknown vendor with NOT_FOUND', async () => {
    const kit = buildVendorsUseCases();

    await expect(
      kit.suspendVendor.execute({
        vendorId: '00000000-0000-4000-8000-0000000000ff',
        actorId: ADMIN,
        reason: 'r',
      }),
    ).rejects.toMatchObject({ code: ErrorCode.NOT_FOUND });
  });
});

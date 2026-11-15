import { ErrorCode } from '@common/errors/error-code.enum';
import { buildVendorsUseCases } from './vendors-use-cases.fake';
import { ADMIN, submitted } from './vendors-test-data.fake';

describe('ChangeVendorCommissionUseCase', () => {
  async function vendorAt(commissionBasisPoints: number) {
    const kit = buildVendorsUseCases();
    const application = await submitted(kit);
    const vendor = await kit.approveApplication.execute({
      applicationId: application.id,
      reviewerId: ADMIN,
      commissionBasisPoints,
    });
    return { kit, vendor };
  }

  it('sets the commission, records the previous value and audits it', async () => {
    const { kit, vendor } = await vendorAt(1000);

    const result = await kit.changeCommission.execute({
      vendorId: vendor.id,
      actorId: ADMIN,
      commissionBasisPoints: 1250,
    });

    expect(result.vendor.commissionBasisPoints).toBe(1250);
    expect(kit.history.rows.at(-1)).toMatchObject({
      vendorId: vendor.id,
      commissionBasisPoints: 1250,
      previousCommissionBasisPoints: 1000,
      changedById: ADMIN,
    });
    expect(kit.audit.rows.at(-1)).toEqual({
      actorId: ADMIN,
      action: 'vendors.vendor.commission_changed',
      entity: 'vendor',
      entityId: vendor.id,
      metadata: {
        commissionBasisPoints: 1250,
        previousCommissionBasisPoints: 1000,
      },
    });
  });

  it('changes and records nothing when the commission is already that value', async () => {
    const { kit, vendor } = await vendorAt(1000);
    const before = { history: kit.history.rows, audit: kit.audit.rows };

    await kit.changeCommission.execute({
      vendorId: vendor.id,
      actorId: ADMIN,
      commissionBasisPoints: 1000,
    });

    expect(kit.history.rows).toBe(before.history);
    expect(kit.audit.rows).toBe(before.audit);
  });

  it('refuses with CONFLICT, recording nothing, when another change wins after the read', async () => {
    const { kit, vendor } = await vendorAt(1000);
    const findById = kit.vendors.findById.bind(kit.vendors);
    jest.spyOn(kit.vendors, 'findById').mockImplementationOnce(async (id) => {
      const found = await findById(id);
      await kit.vendors.changeCommission(id, 1000, 1100);
      return found;
    });
    const historyBefore = kit.history.rows;

    await expect(
      kit.changeCommission.execute({
        vendorId: vendor.id,
        actorId: ADMIN,
        commissionBasisPoints: 1250,
      }),
    ).rejects.toMatchObject({ code: ErrorCode.CONFLICT });
    expect(kit.history.rows).toBe(historyBefore);
  });

  it('refuses an unknown vendor and a commission out of range', async () => {
    const { kit, vendor } = await vendorAt(1000);

    await expect(
      kit.changeCommission.execute({
        vendorId: '00000000-0000-4000-8000-0000000000ff',
        actorId: ADMIN,
        commissionBasisPoints: 1250,
      }),
    ).rejects.toMatchObject({ code: ErrorCode.NOT_FOUND });
    await expect(
      kit.changeCommission.execute({
        vendorId: vendor.id,
        actorId: ADMIN,
        commissionBasisPoints: -1,
      }),
    ).rejects.toMatchObject({ code: ErrorCode.VALIDATION_FAILED });
  });
});

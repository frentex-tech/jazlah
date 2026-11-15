import { ErrorCode } from '@common/errors/error-code.enum';
import { buildVendorsUseCases } from './vendors-use-cases.fake';
import { ADMIN, submitted } from './vendors-test-data.fake';

describe('ListVendorCommissionChangesUseCase', () => {
  it("lists the vendor's commission history newest first, the original entries unchanged", async () => {
    const kit = buildVendorsUseCases();
    const application = await submitted(kit);
    const vendor = await kit.approveApplication.execute({
      applicationId: application.id,
      reviewerId: ADMIN,
      commissionBasisPoints: 1000,
    });
    const first = kit.history.rows[0];
    await kit.changeCommission.execute({
      vendorId: vendor.id,
      actorId: ADMIN,
      commissionBasisPoints: 1250,
    });

    const page = await kit.listCommissionChanges.execute(vendor.id, {
      cursor: null,
      limit: 20,
    });

    expect(
      page.items.map((entry) => [
        entry.commissionBasisPoints,
        entry.previousCommissionBasisPoints,
      ]),
    ).toEqual([
      [1250, 1000],
      [1000, null],
    ]);
    expect(page.items[1]).toBe(first);
  });

  it('is NOT_FOUND for an unknown vendor', async () => {
    const kit = buildVendorsUseCases();

    await expect(
      kit.listCommissionChanges.execute(
        '00000000-0000-4000-8000-0000000000ff',
        {
          cursor: null,
          limit: 20,
        },
      ),
    ).rejects.toMatchObject({ code: ErrorCode.NOT_FOUND });
  });
});

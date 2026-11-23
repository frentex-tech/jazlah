import { ErrorCode } from '@common/errors/error-code.enum';
import { buildVendorsUseCases } from './vendors-use-cases.fake';
import { ADMIN, submitted } from './vendors-test-data.fake';

describe('GetVendorUseCase', () => {
  it('returns a vendor in any status', async () => {
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

    await expect(kit.getVendor.execute(vendor.id)).resolves.toMatchObject({
      vendor: { id: vendor.id, status: 'suspended' },
      logoUrl: null,
    });
  });

  it('is NOT_FOUND for an unknown id', async () => {
    const kit = buildVendorsUseCases();

    await expect(
      kit.getVendor.execute('00000000-0000-4000-8000-0000000000ff'),
    ).rejects.toMatchObject({ code: ErrorCode.NOT_FOUND });
  });
});

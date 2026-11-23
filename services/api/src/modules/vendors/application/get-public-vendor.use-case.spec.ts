import { ErrorCode } from '@common/errors/error-code.enum';
import { buildVendorsUseCases } from './vendors-use-cases.fake';
import { ADMIN, submitted } from './vendors-test-data.fake';

describe('GetPublicVendorUseCase', () => {
  it('returns an active vendor, and answers a suspended one exactly like an unknown id', async () => {
    const kit = buildVendorsUseCases();
    const application = await submitted(kit);
    const vendor = await kit.approveApplication.execute({
      applicationId: application.id,
      reviewerId: ADMIN,
      commissionBasisPoints: 1000,
    });

    await expect(kit.getPublicVendor.execute(vendor.id)).resolves.toMatchObject(
      {
        vendor: { id: vendor.id },
      },
    );
    await kit.suspendVendor.execute({
      vendorId: vendor.id,
      actorId: ADMIN,
      reason: 'r',
    });
    await expect(kit.getPublicVendor.execute(vendor.id)).rejects.toMatchObject({
      code: ErrorCode.NOT_FOUND,
    });
    await expect(
      kit.getPublicVendor.execute('00000000-0000-4000-8000-0000000000ff'),
    ).rejects.toMatchObject({ code: ErrorCode.NOT_FOUND });
  });
});

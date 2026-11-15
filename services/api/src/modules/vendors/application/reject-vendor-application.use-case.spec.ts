import { ErrorCode } from '@common/errors/error-code.enum';
import { buildVendorsUseCases } from './vendors-use-cases.fake';
import { ADMIN, submitted } from './vendors-test-data.fake';

describe('RejectVendorApplicationUseCase', () => {
  it('rejects with the reason and audits it', async () => {
    const kit = buildVendorsUseCases();
    const application = await submitted(kit);

    const rejected = await kit.rejectApplication.execute({
      applicationId: application.id,
      reviewerId: ADMIN,
      reason: 'السجل منتهي',
    });

    expect(rejected).toMatchObject({
      status: 'rejected',
      rejectionReason: 'السجل منتهي',
      reviewedById: ADMIN,
    });
    expect(kit.audit.rows).toEqual([
      {
        actorId: ADMIN,
        action: 'vendors.application.rejected',
        entity: 'vendor_application',
        entityId: application.id,
      },
    ]);
  });

  it('refuses an application already reviewed, and an unknown one', async () => {
    const kit = buildVendorsUseCases();
    const application = await submitted(kit);
    const input = {
      applicationId: application.id,
      reviewerId: ADMIN,
      reason: 'reason',
    };
    await kit.rejectApplication.execute(input);

    await expect(kit.rejectApplication.execute(input)).rejects.toMatchObject({
      code: ErrorCode.VENDOR_APPLICATION_NOT_PENDING,
    });
    await expect(
      kit.rejectApplication.execute({
        ...input,
        applicationId: '00000000-0000-4000-8000-0000000000ff',
      }),
    ).rejects.toMatchObject({ code: ErrorCode.NOT_FOUND });
    expect(kit.audit.rows).toHaveLength(1);
  });
});

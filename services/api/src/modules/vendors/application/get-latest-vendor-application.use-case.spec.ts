import { ErrorCode } from '@common/errors/error-code.enum';
import { buildVendorsUseCases } from './vendors-use-cases.fake';
import {
  ADMIN,
  APPLICANT,
  OTHER_CUSTOMER,
  submitted,
} from './vendors-test-data.fake';

describe('GetLatestVendorApplicationUseCase', () => {
  it("returns the applicant's newest application", async () => {
    const kit = buildVendorsUseCases();
    const first = await submitted(kit);
    await kit.rejectApplication.execute({
      applicationId: first.id,
      reviewerId: ADMIN,
      reason: 'r',
    });
    const second = await submitted(kit);

    await expect(
      kit.getLatestApplication.execute(APPLICANT),
    ).resolves.toMatchObject({ id: second.id, status: 'pending' });
  });

  it('is NOT_FOUND for someone who never applied, even when others did', async () => {
    const kit = buildVendorsUseCases();
    await submitted(kit);

    await expect(
      kit.getLatestApplication.execute(OTHER_CUSTOMER),
    ).rejects.toMatchObject({ code: ErrorCode.NOT_FOUND });
  });
});

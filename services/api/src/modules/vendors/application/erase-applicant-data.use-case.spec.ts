import { buildVendorsUseCases } from './vendors-use-cases.fake';
import {
  ADMIN,
  APPLICANT,
  OTHER_CUSTOMER,
  applicationInput,
  submitted,
} from './vendors-test-data.fake';

describe('EraseApplicantDataUseCase', () => {
  it('deletes a pending application and discards every document of the applicant', async () => {
    const kit = buildVendorsUseCases();
    await submitted(kit);

    await kit.eraseApplicantData.execute(APPLICANT);

    expect(kit.applications.rows).toEqual([]);
    expect(kit.media.discarded).toEqual([{ ownerId: APPLICANT, keep: [] }]);
  });

  it('deletes rejected applications too', async () => {
    const kit = buildVendorsUseCases();
    const application = await submitted(kit);
    await kit.rejectApplication.execute({
      applicationId: application.id,
      reviewerId: ADMIN,
      reason: 'The certificate has expired',
    });

    await kit.eraseApplicantData.execute(APPLICANT);

    expect(kit.applications.rows).toEqual([]);
  });

  it("keeps an approved application and its documents: the vendor's business record", async () => {
    const kit = buildVendorsUseCases();
    const application = await submitted(kit);
    await kit.approveApplication.execute({
      applicationId: application.id,
      reviewerId: ADMIN,
      commissionBasisPoints: 1250,
    });

    await kit.eraseApplicantData.execute(APPLICANT);

    expect(kit.applications.rows.map((row) => row.application.id)).toEqual([
      application.id,
    ]);
    expect(kit.media.discarded).toEqual([
      {
        ownerId: APPLICANT,
        keep: application.documents.map((document) => document.mediaId),
      },
    ]);
  });

  it("leaves other applicants' applications alone", async () => {
    const kit = buildVendorsUseCases();
    await kit.submitApplication.execute(
      applicationInput(kit, { applicantId: OTHER_CUSTOMER }),
    );

    await kit.eraseApplicantData.execute(APPLICANT);

    expect(kit.applications.rows).toHaveLength(1);
  });
});

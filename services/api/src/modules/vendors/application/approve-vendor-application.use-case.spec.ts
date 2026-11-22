import { AppError } from '@common/errors/app-error';
import { ErrorCode } from '@common/errors/error-code.enum';
import { buildVendorsUseCases } from './vendors-use-cases.fake';
import {
  ADMIN,
  APPLICANT,
  OTHER_CUSTOMER,
  applicationInput,
  submitted,
} from './vendors-test-data.fake';

const UNKNOWN = '00000000-0000-4000-8000-0000000000ff';

describe('ApproveVendorApplicationUseCase', () => {
  it('approves, creates the vendor with its commission, VAT number and city, records the history, grants access and audits, together', async () => {
    const kit = buildVendorsUseCases();
    const application = await submitted(kit);

    const vendor = await kit.approveApplication.execute({
      applicationId: application.id,
      reviewerId: ADMIN,
      commissionBasisPoints: 1250,
    });

    expect(vendor).toMatchObject({
      status: 'active',
      isPlatform: false,
      commissionBasisPoints: 1250,
      ibanLast4: '7519',
      applicationId: application.id,
      name: application.details.name,
      vatNumber: '310123456700003',
      city: 'الرياض',
      contactPhone: null,
      contactEmail: null,
      coverMediaId: null,
    });
    expect(kit.vendors.rows[0]?.iban).toEqual(kit.applications.rows[0]?.iban);
    expect(await kit.applications.findById(application.id)).toMatchObject({
      status: 'approved',
      reviewedById: ADMIN,
    });
    expect(kit.history.rows).toEqual([
      expect.objectContaining({
        vendorId: vendor.id,
        commissionBasisPoints: 1250,
        previousCommissionBasisPoints: null,
        changedById: ADMIN,
      }),
    ]);
    expect(kit.access.grants).toEqual([
      { userId: APPLICANT, vendorId: vendor.id },
    ]);
    expect(kit.audit.rows).toEqual([
      {
        actorId: ADMIN,
        action: 'vendors.application.approved',
        entity: 'vendor_application',
        entityId: application.id,
        metadata: { vendorId: vendor.id, commissionBasisPoints: 1250 },
      },
    ]);
  });

  it('leaves the application pending, and nothing written, when granting access fails', async () => {
    const kit = buildVendorsUseCases();
    const application = await submitted(kit);
    kit.access.failNextWith(new AppError(ErrorCode.VENDOR_ACCESS_ALREADY_HELD));

    await expect(
      kit.approveApplication.execute({
        applicationId: application.id,
        reviewerId: ADMIN,
        commissionBasisPoints: 1250,
      }),
    ).rejects.toMatchObject({ code: ErrorCode.VENDOR_ACCESS_ALREADY_HELD });

    expect((await kit.applications.findById(application.id))?.status).toBe(
      'pending',
    );
    expect(kit.vendors.rows).toEqual([]);
    expect(kit.history.rows).toEqual([]);
    expect(kit.audit.rows).toEqual([]);
  });

  it('refuses a second application with the same commercial registration number once the first is approved, leaving it pending', async () => {
    const kit = buildVendorsUseCases();
    const first = await submitted(kit);
    const second = await kit.submitApplication.execute(
      applicationInput(kit, { applicantId: OTHER_CUSTOMER }),
    );
    await kit.approveApplication.execute({
      applicationId: first.id,
      reviewerId: ADMIN,
      commissionBasisPoints: 1000,
    });

    await expect(
      kit.approveApplication.execute({
        applicationId: second.id,
        reviewerId: ADMIN,
        commissionBasisPoints: 1000,
      }),
    ).rejects.toMatchObject({ code: ErrorCode.VENDOR_CR_EXISTS });
    expect(
      kit.applications.rows.find((row) => row.application.id === second.id)
        ?.application.status,
    ).toBe('pending');
  });

  it('refuses an application already reviewed with VENDOR_APPLICATION_NOT_PENDING', async () => {
    const kit = buildVendorsUseCases();
    const application = await submitted(kit);
    const input = {
      applicationId: application.id,
      reviewerId: ADMIN,
      commissionBasisPoints: 1250,
    };
    await kit.approveApplication.execute(input);

    await expect(kit.approveApplication.execute(input)).rejects.toMatchObject({
      code: ErrorCode.VENDOR_APPLICATION_NOT_PENDING,
    });
    expect(kit.vendors.rows).toHaveLength(1);
  });

  it('refuses when the conditional update finds the application no longer pending', async () => {
    const kit = buildVendorsUseCases();
    const application = await submitted(kit);
    // Another review commits between the read and the conditional update.
    const findById = kit.applications.findById.bind(kit.applications);
    jest
      .spyOn(kit.applications, 'findById')
      .mockImplementationOnce(async (id) => {
        const found = await findById(id);
        await kit.applications.markRejected(id, ADMIN, 'reason');
        return found;
      });

    await expect(
      kit.approveApplication.execute({
        applicationId: application.id,
        reviewerId: ADMIN,
        commissionBasisPoints: 1250,
      }),
    ).rejects.toMatchObject({ code: ErrorCode.VENDOR_APPLICATION_NOT_PENDING });
    expect(kit.vendors.rows).toEqual([]);
  });

  it('refuses an unknown application with NOT_FOUND and a commission out of range with VALIDATION_FAILED', async () => {
    const kit = buildVendorsUseCases();
    const application = await submitted(kit);

    await expect(
      kit.approveApplication.execute({
        applicationId: UNKNOWN,
        reviewerId: ADMIN,
        commissionBasisPoints: 1250,
      }),
    ).rejects.toMatchObject({ code: ErrorCode.NOT_FOUND });
    await expect(
      kit.approveApplication.execute({
        applicationId: application.id,
        reviewerId: ADMIN,
        commissionBasisPoints: 10_001,
      }),
    ).rejects.toMatchObject({ code: ErrorCode.VALIDATION_FAILED });
    expect(kit.vendors.rows).toEqual([]);
  });
});

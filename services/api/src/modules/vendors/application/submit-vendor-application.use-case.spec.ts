import { ErrorCode } from '@common/errors/error-code.enum';
import { buildVendorsUseCases } from './vendors-use-cases.fake';
import {
  APPLICANT,
  BAD_CHECKSUM_IBAN,
  IBAN,
  OTHER_CUSTOMER,
  applicationInput,
} from './vendors-test-data.fake';

async function codeOf(work: Promise<unknown>): Promise<unknown> {
  return work.then(
    () => 'resolved',
    (error: unknown) => (error as { code?: unknown }).code,
  );
}

describe('SubmitVendorApplicationUseCase', () => {
  it('stores a pending application, with the IBAN sealed and only its last four kept', async () => {
    const kit = buildVendorsUseCases();

    const application = await kit.submitApplication.execute(
      applicationInput(kit),
    );

    expect(application).toMatchObject({
      applicantId: APPLICANT,
      status: 'pending',
      ibanLast4: '7519',
      rejectionReason: null,
      reviewedAt: null,
    });
    expect(application.documents).toHaveLength(3);
    expect(kit.cipher.sealed).toEqual([IBAN]);
    expect(kit.applications.rows[0]?.iban.ciphertext).not.toContain(IBAN);
  });

  it('refuses a second pending application with VENDOR_APPLICATION_ALREADY_PENDING', async () => {
    const kit = buildVendorsUseCases();
    await kit.submitApplication.execute(applicationInput(kit));

    expect(
      await codeOf(kit.submitApplication.execute(applicationInput(kit))),
    ).toBe(ErrorCode.VENDOR_APPLICATION_ALREADY_PENDING);
    expect(kit.applications.rows).toHaveLength(1);
  });

  it('refuses an applicant who already works for a vendor with VENDOR_ACCESS_ALREADY_HELD, storing nothing', async () => {
    const kit = buildVendorsUseCases();
    await kit.access.grant(APPLICANT, '00000000-0000-4000-8000-0000000000a1');

    expect(
      await codeOf(kit.submitApplication.execute(applicationInput(kit))),
    ).toBe(ErrorCode.VENDOR_ACCESS_ALREADY_HELD);
    expect(kit.applications.rows).toEqual([]);
    expect(kit.cipher.sealed).toEqual([]);
  });

  it('refuses an IBAN that fails the checksum, without sealing it', async () => {
    const kit = buildVendorsUseCases();

    await expect(
      kit.submitApplication.execute(
        applicationInput(kit, { iban: BAD_CHECKSUM_IBAN }),
      ),
    ).rejects.toMatchObject({
      code: ErrorCode.VALIDATION_FAILED,
      details: [{ field: 'iban', constraints: ['isSaudiIban'] }],
    });
    expect(kit.cipher.sealed).toEqual([]);
  });

  it('refuses documents that break the rules', async () => {
    const kit = buildVendorsUseCases();
    const input = applicationInput(kit);

    expect(
      await codeOf(
        kit.submitApplication.execute({
          ...input,
          documents: input.documents.slice(0, 2),
        }),
      ),
    ).toBe(ErrorCode.VALIDATION_FAILED);
  });

  it("answers another user's file exactly like a missing one: MEDIA_NOT_FOUND", async () => {
    const kit = buildVendorsUseCases();
    const mine = applicationInput(kit);
    // The same files, now uploaded by another customer.
    const theirs = applicationInput(kit, { applicantId: OTHER_CUSTOMER });

    expect(
      await codeOf(
        kit.submitApplication.execute({ ...mine, documents: theirs.documents }),
      ),
    ).toBe(ErrorCode.MEDIA_NOT_FOUND);
    const input = applicationInput(kit);
    expect(
      await codeOf(
        kit.submitApplication.execute({
          ...input,
          documents: [
            ...input.documents.slice(0, 2),
            {
              kind: 'facility_photo',
              mediaId: '00000000-0000-4000-8000-0000000000ff',
            },
          ],
        }),
      ),
    ).toBe(ErrorCode.MEDIA_NOT_FOUND);
    expect(kit.applications.rows).toEqual([]);
  });

  it('refuses a file of another purpose as missing, and an unconfirmed one as not ready', async () => {
    const kit = buildVendorsUseCases();
    const input = applicationInput(kit);
    const [first] = input.documents;
    if (first === undefined) {
      throw new Error('no document');
    }

    kit.media.add({
      id: first.mediaId,
      ownerId: APPLICANT,
      purpose: 'vendor.logo',
      isReady: true,
    });
    expect(await codeOf(kit.submitApplication.execute(input))).toBe(
      ErrorCode.MEDIA_NOT_FOUND,
    );

    kit.media.add({
      id: first.mediaId,
      ownerId: APPLICANT,
      purpose: 'vendor.document',
      isReady: false,
    });
    expect(await codeOf(kit.submitApplication.execute(input))).toBe(
      ErrorCode.MEDIA_NOT_READY,
    );
    expect(kit.applications.rows).toEqual([]);
  });

  it('accepts a new application once the previous one was rejected', async () => {
    const kit = buildVendorsUseCases();
    const first = await kit.submitApplication.execute(applicationInput(kit));
    await kit.applications.markRejected(first.id, 'admin', 'reason');

    await expect(
      kit.submitApplication.execute(applicationInput(kit)),
    ).resolves.toMatchObject({ status: 'pending' });
  });
});

import type { VendorApplication } from '../domain/vendor-application.entity';
import type { VendorApplicationDocument } from '../domain/vendor-application-document.type';
import type { SubmitVendorApplicationInput } from './submit-vendor-application-input.type';
import type { VendorsKit } from './vendors-use-cases.fake';

/** A customer of the tests, and an admin. */
export const APPLICANT = '00000000-0000-4000-8000-0000000000c1';
export const OTHER_CUSTOMER = '00000000-0000-4000-8000-0000000000c2';
export const ADMIN = '00000000-0000-4000-8000-0000000000ad';

/** A valid Saudi IBAN (a published example), and the same with a wrong check digit. */
export const IBAN = 'SA0380000000608010167519';
export const BAD_CHECKSUM_IBAN = 'SA0480000000608010167519';

/**
 * The documents of a valid application, each a ready `vendor.document` file of
 * `owner`, added to the media fake.
 */
export function readyDocuments(
  kit: VendorsKit,
  owner = APPLICANT,
): VendorApplicationDocument[] {
  const documents: VendorApplicationDocument[] = [
    {
      kind: 'commercial_registration',
      mediaId: '00000000-0000-4000-8000-0000000000d1',
    },
    {
      kind: 'health_certificate',
      mediaId: '00000000-0000-4000-8000-0000000000d2',
    },
    { kind: 'facility_photo', mediaId: '00000000-0000-4000-8000-0000000000d3' },
  ];
  for (const { mediaId } of documents) {
    kit.media.add({
      id: mediaId,
      ownerId: owner,
      purpose: 'vendor.document',
      isReady: true,
    });
  }
  return documents;
}

/** The input of a valid application by `applicantId`. */
export function applicationInput(
  kit: VendorsKit,
  overrides: Partial<SubmitVendorApplicationInput> = {},
): SubmitVendorApplicationInput {
  return {
    applicantId: APPLICANT,
    details: {
      name: { ar: 'ملحمة النخبة', en: 'Al Nokhba Butchery' },
      description: { ar: null, en: null },
      commercialRegistrationNumber: '1010123456',
      vatNumber: '310123456700003',
      city: 'الرياض',
      accountHolderName: 'مؤسسة النخبة للحوم',
      location: { latitude: 24.7136, longitude: 46.6753 },
    },
    iban: IBAN,
    documents: readyDocuments(kit, overrides.applicantId ?? APPLICANT),
    ...overrides,
  };
}

/** A pending application, submitted through the use case. */
export function submitted(kit: VendorsKit): Promise<VendorApplication> {
  return kit.submitApplication.execute(applicationInput(kit));
}

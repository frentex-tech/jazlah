import { ErrorCode } from '@common/errors/error-code.enum';
import { VendorApplication } from './vendor-application.entity';
import type { VendorApplicationDocument } from './vendor-application-document.type';

const id = (n: number): string =>
  `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`;

const ONE_OF_EACH: VendorApplicationDocument[] = [
  { kind: 'commercial_registration', mediaId: id(1) },
  { kind: 'health_certificate', mediaId: id(2) },
  { kind: 'facility_photo', mediaId: id(3) },
];

function failedRules(documents: readonly VendorApplicationDocument[]) {
  try {
    VendorApplication.assertDocuments(documents);
    return null;
  } catch (error) {
    return error;
  }
}

describe('VendorApplication.assertDocuments', () => {
  it('accepts one document of each kind, and more photos up to ten in all', () => {
    expect(failedRules(ONE_OF_EACH)).toBeNull();
    expect(
      failedRules([
        ...ONE_OF_EACH,
        ...[4, 5, 6, 7, 8, 9, 10].map((n) => ({
          kind: 'facility_photo' as const,
          mediaId: id(n),
        })),
      ]),
    ).toBeNull();
  });

  it.each([
    ['a missing kind', ONE_OF_EACH.slice(0, 2), ['requiresEachDocumentKind']],
    [
      'the same file twice',
      [...ONE_OF_EACH, { kind: 'facility_photo' as const, mediaId: id(3) }],
      ['uniqueFiles'],
    ],
    [
      'more than ten documents',
      [
        ...ONE_OF_EACH,
        ...[4, 5, 6, 7, 8, 9, 10, 11].map((n) => ({
          kind: 'facility_photo' as const,
          mediaId: id(n),
        })),
      ],
      ['arrayMaxSize'],
    ],
    ['nothing', [], ['requiresEachDocumentKind']],
  ])(
    'refuses %s with a field error on documents',
    (_label, documents, rules) => {
      expect(failedRules(documents)).toMatchObject({
        code: ErrorCode.VALIDATION_FAILED,
        details: [{ field: 'documents', constraints: rules }],
      });
    },
  );
});

import { describeUploadPurposes } from './describe-upload-purposes';

describe('describeUploadPurposes', () => {
  it('lists each purpose with its types, size range and visibility, in the order given', () => {
    expect(describeUploadPurposes(['vendor.document', 'vendor.logo'])).toBe(
      [
        '- `vendor.document`: application/pdf, image/jpeg, image/png; 1 byte to 10 MiB (10485760 bytes); private (read only through a short-lived link from the API).',
        '- `vendor.logo`: image/jpeg, image/png, image/webp; 1 byte to 2 MiB (2097152 bytes); public (anyone can read it at a stable URL).',
      ].join('\n'),
    );
  });

  it('describes the vendor cover photo with the limits of the logo', () => {
    expect(describeUploadPurposes(['vendor.cover'])).toBe(
      '- `vendor.cover`: image/jpeg, image/png, image/webp; 1 byte to 2 MiB (2097152 bytes); public (anyone can read it at a stable URL).',
    );
  });

  it('describes a category image with the limits of a vendor logo', () => {
    expect(describeUploadPurposes(['catalog.category-image'])).toBe(
      '- `catalog.category-image`: image/jpeg, image/png, image/webp; 1 byte to 2 MiB (2097152 bytes); public (anyone can read it at a stable URL).',
    );
  });

  it('is empty for no purpose', () => {
    expect(describeUploadPurposes([])).toBe('');
  });
});

import { CONTENT_SIGNATURE_LENGTH } from './content-signatures.constants';
import { detectContentType } from './detect-content-type';

const bytes = (...values: (number | string)[]): Uint8Array =>
  Uint8Array.from(
    values.flatMap((value) =>
      typeof value === 'string'
        ? [...value].map((character) => character.charCodeAt(0))
        : [value],
    ),
  );

/** The first bytes of a real file of each type, padded past the signature. */
const JPEG = bytes(0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 'JFIF', 0x00, 0x01);
const PNG = bytes(0x89, 'PNG', 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d);
const WEBP = bytes('RIFF', 0x24, 0x00, 0x00, 0x00, 'WEBPVP8 ');
const PDF = bytes('%PDF-1.7', 0x0a, '%', 0xe2, 0xe3);

describe('detectContentType', () => {
  it.each([
    ['image/jpeg', JPEG],
    ['image/png', PNG],
    ['image/webp', WEBP],
    ['application/pdf', PDF],
  ])('recognises %s from its signature', (expected, header) => {
    expect(detectContentType(header)).toBe(expected);
  });

  it('needs no more than CONTENT_SIGNATURE_LENGTH bytes', () => {
    expect(CONTENT_SIGNATURE_LENGTH).toBe(12);
    expect(detectContentType(WEBP.subarray(0, CONTENT_SIGNATURE_LENGTH))).toBe(
      'image/webp',
    );
  });

  it('does not recognise a Windows executable renamed to .jpg', () => {
    // A PE file starts with the DOS header "MZ".
    expect(
      detectContentType(bytes('MZ', 0x90, 0x00, 0x03, 0x00, 0x00, 0x00)),
    ).toBeNull();
  });

  it('does not recognise a Linux executable', () => {
    expect(
      detectContentType(bytes(0x7f, 'ELF', 0x02, 0x01, 0x01, 0x00)),
    ).toBeNull();
  });

  it('does not recognise an empty file', () => {
    expect(detectContentType(new Uint8Array())).toBeNull();
  });

  it.each([
    ['a PNG cut inside its signature', PNG.subarray(0, 5)],
    ['a JPEG with only the SOI marker', JPEG.subarray(0, 2)],
    ['a RIFF header without the WEBP form type', WEBP.subarray(0, 10)],
    ['a PDF header cut before the dash', PDF.subarray(0, 4)],
  ])('does not recognise a truncated header: %s', (_label, header) => {
    expect(detectContentType(header)).toBeNull();
  });

  it('does not take another RIFF format (WAVE) for WebP', () => {
    expect(
      detectContentType(bytes('RIFF', 0x24, 0x00, 0x00, 0x00, 'WAVEfmt ')),
    ).toBeNull();
  });

  it('does not recognise text that declares itself an image', () => {
    expect(
      detectContentType(bytes('<svg xmlns="http://www.w3.org/2000/svg">')),
    ).toBeNull();
  });
});

import type { ContentSignature } from './content-signature.type';

const ascii = (text: string): number[] =>
  [...text].map((character) => character.charCodeAt(0));

/**
 * The magic numbers of each detectable type, from the format specifications:
 * - JPEG: the SOI marker FF D8 followed by the next marker's FF (JPEG, ITU-T T.81 B.1).
 * - PNG: the 8-byte signature 89 50 4E 47 0D 0A 1A 0A (PNG specification, 5.2).
 * - WebP: a RIFF container, `RIFF` at 0 and the form type `WEBP` at 8 (RFC 9649, 2.4).
 * - PDF: the header `%PDF-` at 0 (ISO 32000-1, 7.5.2).
 */
export const CONTENT_SIGNATURES: readonly ContentSignature[] = [
  {
    contentType: 'image/jpeg',
    parts: [{ offset: 0, bytes: [0xff, 0xd8, 0xff] }],
  },
  {
    contentType: 'image/png',
    parts: [
      { offset: 0, bytes: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a] },
    ],
  },
  {
    contentType: 'image/webp',
    parts: [
      { offset: 0, bytes: ascii('RIFF') },
      { offset: 8, bytes: ascii('WEBP') },
    ],
  },
  {
    contentType: 'application/pdf',
    parts: [{ offset: 0, bytes: ascii('%PDF-') }],
  },
];

/** How many leading bytes `detectContentType` needs: the end of the longest signature. */
export const CONTENT_SIGNATURE_LENGTH = Math.max(
  ...CONTENT_SIGNATURES.flatMap((signature) =>
    signature.parts.map((part) => part.offset + part.bytes.length),
  ),
);

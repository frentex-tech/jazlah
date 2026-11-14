import { CONTENT_SIGNATURES } from './content-signatures.constants';
import type { DetectableContentType } from './detectable-content-type.type';

/**
 * The real type of a file, read from its first bytes (magic numbers), or null when
 * they match no known signature: an empty or truncated file, or any other format (an
 * executable renamed to `.jpg` included). Pass at least CONTENT_SIGNATURE_LENGTH bytes
 * when the file has them.
 *
 * Never trust a declared Content-Type or a file name: they are whatever the client
 * sent. Recognising a signature proves the format's header, not that the rest of the
 * file is well formed.
 */
export function detectContentType(
  bytes: Uint8Array,
): DetectableContentType | null {
  const signature = CONTENT_SIGNATURES.find((candidate) =>
    candidate.parts.every(
      (part) =>
        bytes.length >= part.offset + part.bytes.length &&
        part.bytes.every((byte, index) => bytes[part.offset + index] === byte),
    ),
  );
  return signature?.contentType ?? null;
}

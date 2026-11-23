import type { UploadPurpose } from './upload-purpose.type';
import { UPLOAD_PURPOSES } from './upload-purposes.constants';

const MEBIBYTE = 1024 * 1024;

/**
 * The limits of the given upload purposes as a Markdown list, for the API documentation:
 * one line per purpose with its accepted types, its size range and who can read its files.
 * Read from UPLOAD_PURPOSES, so the document states what is enforced and changes with it.
 *
 *   - `vendor.logo`: image/jpeg, image/png, image/webp; 1 byte to 2 MiB (2097152 bytes);
 *     public (anyone can read it at a stable URL).
 */
export function describeUploadPurposes(
  purposes: readonly UploadPurpose[],
): string {
  return purposes
    .map((purpose) => {
      const policy = UPLOAD_PURPOSES[purpose];
      const size = `1 byte to ${policy.maxSizeBytes / MEBIBYTE} MiB (${policy.maxSizeBytes} bytes)`;
      const readers =
        policy.visibility === 'public'
          ? 'public (anyone can read it at a stable URL)'
          : 'private (read only through a short-lived link from the API)';
      return `- \`${purpose}\`: ${policy.contentTypes.join(', ')}; ${size}; ${readers}.`;
    })
    .join('\n');
}

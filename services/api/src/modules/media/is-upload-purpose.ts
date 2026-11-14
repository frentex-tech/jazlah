import type { UploadPurpose } from './upload-purpose.type';
import { UPLOAD_PURPOSES } from './upload-purposes.constants';

/** Whether a stored or received value names a declared upload purpose. */
export function isUploadPurpose(value: string): value is UploadPurpose {
  return Object.hasOwn(UPLOAD_PURPOSES, value);
}

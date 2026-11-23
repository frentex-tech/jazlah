import type { UPLOAD_PURPOSES } from './upload-purposes.constants';

/** The name of an upload purpose (`catalog.product-image`). */
export type UploadPurpose = keyof typeof UPLOAD_PURPOSES;

import type { UploadPurpose } from './upload-purpose.type';

/** What MediaService.requestUpload needs. */
export type RequestUploadInput = Readonly<{
  purpose: UploadPurpose;
  /** The Content-Type the client will upload with; must be allowed for the purpose. */
  contentType: string;
  /** The client's file name, display metadata only; sanitised before it is stored. */
  fileName?: string | null;
  /** Null until authentication exists. */
  ownerId?: string | null;
}>;

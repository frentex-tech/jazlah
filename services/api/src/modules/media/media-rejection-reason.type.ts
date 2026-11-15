/**
 * Why an upload was rejected, sent to the client as `details.reason` with
 * MEDIA_UPLOAD_REJECTED. A public contract, like an error code: never rename one.
 */
export type MediaRejectionReason =
  | 'OBJECT_MISSING'
  | 'EMPTY_FILE'
  | 'TOO_LARGE'
  | 'TYPE_NOT_ALLOWED'
  | 'CONTENT_TYPE_MISMATCH'
  | 'EXPIRED';

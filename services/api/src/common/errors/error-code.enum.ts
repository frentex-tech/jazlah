/**
 * Every error code the API returns. Clients branch on these values.
 *
 * A code is a contract with the mobile app: once released it is never renamed,
 * never removed and never reused for a different meaning. A new situation gets a
 * new code, with its messages in error-messages.constants.ts and its HTTP status
 * in error-statuses.constants.ts.
 */
export enum ErrorCode {
  /** The input was wrong. Produced only by the validation pipe, with per-field details. */
  VALIDATION_FAILED = 'VALIDATION_FAILED',
  /** A 400 that is not a validation failure, and any 4xx without a code of its own. */
  BAD_REQUEST = 'BAD_REQUEST',
  NOT_FOUND = 'NOT_FOUND',
  METHOD_NOT_ALLOWED = 'METHOD_NOT_ALLOWED',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  CONFLICT = 'CONFLICT',
  PAYLOAD_TOO_LARGE = 'PAYLOAD_TOO_LARGE',
  UNSUPPORTED_MEDIA_TYPE = 'UNSUPPORTED_MEDIA_TYPE',
  RATE_LIMITED = 'RATE_LIMITED',
  /**
   * Two requests changed the same data at the same time and this one lost, even after
   * retrying. Nothing was saved; the client may send the request again.
   */
  TRANSACTION_CONFLICT = 'TRANSACTION_CONFLICT',
  /** The API cannot reach a dependency it needs (the database) right now. Retryable. */
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  /** The declared content type is not one the upload purpose accepts. Nothing was created. */
  MEDIA_CONTENT_TYPE_NOT_ALLOWED = 'MEDIA_CONTENT_TYPE_NOT_ALLOWED',
  /** No file with this id exists (never requested, or already cleaned up). */
  MEDIA_NOT_FOUND = 'MEDIA_NOT_FOUND',
  /** The upload was not confirmed in time; request a new upload. */
  MEDIA_UPLOAD_EXPIRED = 'MEDIA_UPLOAD_EXPIRED',
  /**
   * The uploaded file failed the checks at confirmation (missing, empty, too large, or
   * its real type not allowed) and was deleted. `details.reason` says which.
   */
  MEDIA_UPLOAD_REJECTED = 'MEDIA_UPLOAD_REJECTED',
  /** The file exists but its upload has not been confirmed, or was rejected. */
  MEDIA_NOT_READY = 'MEDIA_NOT_READY',
}

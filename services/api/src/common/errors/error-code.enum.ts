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
  /**
   * Signed in with the right audience, but this staff user lacks the permission the
   * action needs (admin permissions, ADM-API-1). Unlike FORBIDDEN, the session is fine:
   * a client shows "not allowed" and keeps the user signed in. Details: `{ permission }`.
   */
  PERMISSION_DENIED = 'PERMISSION_DENIED',
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
  /** The verification code is wrong; the attempt was counted. */
  OTP_INVALID = 'OTP_INVALID',
  /**
   * No code can be verified for this phone and audience: none was requested, it
   * expired, it was used, or its attempts ran out. Request a new code.
   */
  OTP_EXPIRED = 'OTP_EXPIRED',
  /**
   * The refresh token cannot be exchanged: unknown, expired, already used, or its
   * session has ended. Sign in again.
   */
  REFRESH_TOKEN_INVALID = 'REFRESH_TOKEN_INVALID',
  /** The access token was valid and has expired: refresh it, no new sign-in needed. */
  ACCESS_TOKEN_EXPIRED = 'ACCESS_TOKEN_EXPIRED',
  /** The account has been disabled; signing in or refreshing will not help. */
  ACCOUNT_DISABLED = 'ACCOUNT_DISABLED',
  /** The user already has a vendor application waiting for review; nothing was created. */
  VENDOR_APPLICATION_ALREADY_PENDING = 'VENDOR_APPLICATION_ALREADY_PENDING',
  /** The vendor application was already approved or rejected; it cannot be reviewed again. */
  VENDOR_APPLICATION_NOT_PENDING = 'VENDOR_APPLICATION_NOT_PENDING',
  /**
   * The vendor the user works for is suspended: vendor routes, signing in and refreshing
   * as that vendor are refused until an admin reinstates it.
   */
  VENDOR_SUSPENDED = 'VENDOR_SUSPENDED',
  /**
   * The user already works for a vendor (active vendor access): refused when applying to
   * become a vendor, and at approval when the access came after the application.
   */
  VENDOR_ACCESS_ALREADY_HELD = 'VENDOR_ACCESS_ALREADY_HELD',
  /**
   * The product's status does not allow this: editing a product under review, or a
   * review step on a product that is not waiting for it. Details: `{ status }`.
   */
  PRODUCT_NOT_EDITABLE = 'PRODUCT_NOT_EDITABLE',
  /**
   * The product cannot go to review or be published as it is. Details: `{ reasons }`,
   * each NO_SIZE or NO_IMAGE.
   */
  PRODUCT_NOT_SUBMITTABLE = 'PRODUCT_NOT_SUBMITTABLE',
  /**
   * An admin approved or rejected a change request the vendor has since replaced with a
   * newer edit: the dashboard reloads and shows the newer request.
   */
  PRODUCT_CHANGE_REQUEST_SUPERSEDED = 'PRODUCT_CHANGE_REQUEST_SUPERSEDED',
  /**
   * The customer already has the most saved addresses allowed; nothing was added.
   * Details: `{ limit }`.
   */
  ADDRESS_LIMIT_REACHED = 'ADDRESS_LIMIT_REACHED',
  /**
   * The account holds vendor, kitchen or admin access, so it cannot be deleted through
   * the app until that access is removed.
   */
  ACCOUNT_HAS_STAFF_ACCESS = 'ACCOUNT_HAS_STAFF_ACCESS',
  /**
   * The action needs a recent sign-in (account deletion: within the last 10 minutes).
   * Sign in again, then repeat it. 403, not 401, so a client does not just refresh.
   */
  RECENT_SIGN_IN_REQUIRED = 'RECENT_SIGN_IN_REQUIRED',
  /**
   * A coverage zone's boundary is not a valid polygon: not closed, too few points, a
   * position out of range, or edges that cross (PostGIS ST_IsValid). Nothing was saved.
   */
  INVALID_POLYGON = 'INVALID_POLYGON',
}

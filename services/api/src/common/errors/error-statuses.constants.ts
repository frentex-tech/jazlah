import { ErrorCode } from './error-code.enum';

/**
 * The HTTP status an AppError takes for each code unless the thrower overrides it.
 * Plain numbers, not Nest's HttpStatus: src/common/errors imports no package, so
 * domain code may throw AppError (R8).
 */
export const ERROR_STATUSES: Readonly<Record<ErrorCode, number>> = {
  [ErrorCode.VALIDATION_FAILED]: 400,
  [ErrorCode.BAD_REQUEST]: 400,
  [ErrorCode.NOT_FOUND]: 404,
  [ErrorCode.METHOD_NOT_ALLOWED]: 405,
  [ErrorCode.PAYLOAD_TOO_LARGE]: 413,
  [ErrorCode.UNSUPPORTED_MEDIA_TYPE]: 415,
  [ErrorCode.UNAUTHORIZED]: 401,
  [ErrorCode.FORBIDDEN]: 403,
  [ErrorCode.PERMISSION_DENIED]: 403,
  [ErrorCode.CONFLICT]: 409,
  [ErrorCode.RATE_LIMITED]: 429,
  [ErrorCode.TRANSACTION_CONFLICT]: 409,
  [ErrorCode.SERVICE_UNAVAILABLE]: 503,
  [ErrorCode.INTERNAL_ERROR]: 500,
  [ErrorCode.MEDIA_CONTENT_TYPE_NOT_ALLOWED]: 415,
  [ErrorCode.MEDIA_NOT_FOUND]: 404,
  [ErrorCode.MEDIA_UPLOAD_EXPIRED]: 410,
  [ErrorCode.MEDIA_UPLOAD_REJECTED]: 422,
  [ErrorCode.MEDIA_NOT_READY]: 409,
  // Not 401: a client that refreshes its token on every 401 must not do so here.
  [ErrorCode.OTP_INVALID]: 422,
  [ErrorCode.OTP_EXPIRED]: 410,
  [ErrorCode.REFRESH_TOKEN_INVALID]: 401,
  [ErrorCode.ACCESS_TOKEN_EXPIRED]: 401,
  [ErrorCode.ACCOUNT_DISABLED]: 403,
  [ErrorCode.VENDOR_APPLICATION_ALREADY_PENDING]: 409,
  [ErrorCode.VENDOR_APPLICATION_NOT_PENDING]: 409,
  [ErrorCode.VENDOR_SUSPENDED]: 403,
  [ErrorCode.VENDOR_ACCESS_ALREADY_HELD]: 409,
  [ErrorCode.VENDOR_CR_EXISTS]: 409,
  [ErrorCode.PRODUCT_NOT_EDITABLE]: 409,
  [ErrorCode.PRODUCT_NOT_SUBMITTABLE]: 422,
  [ErrorCode.PRODUCT_CHANGE_REQUEST_SUPERSEDED]: 409,
  [ErrorCode.ADDRESS_LIMIT_REACHED]: 409,
  [ErrorCode.ACCOUNT_HAS_STAFF_ACCESS]: 409,
  [ErrorCode.RECENT_SIGN_IN_REQUIRED]: 403,
  [ErrorCode.INVALID_POLYGON]: 422,
};

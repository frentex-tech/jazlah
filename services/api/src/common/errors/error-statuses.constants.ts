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
};

import { ErrorCode } from '@common/errors/error-code.enum';

/** The errors a product content body can meet (invalid fields, unusable images). */
export const PRODUCT_CONTENT_ERRORS = [
  ErrorCode.VALIDATION_FAILED,
  ErrorCode.MEDIA_NOT_FOUND,
  ErrorCode.MEDIA_NOT_READY,
] as const;

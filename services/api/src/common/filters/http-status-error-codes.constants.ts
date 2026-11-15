import { HttpStatus } from '@nestjs/common';
import { ErrorCode } from '../errors/error-code.enum';

/**
 * The code given to a Nest HttpException (an unknown route, a guard's refusal and
 * the like), by its status. A 4xx status not listed here becomes BAD_REQUEST and a
 * 5xx becomes INTERNAL_ERROR, each keeping its own status.
 *
 * VALIDATION_FAILED is deliberately absent: clients read it as "the input was wrong",
 * so only the validation pipe produces it.
 */
export const HTTP_STATUS_ERROR_CODES: Readonly<
  Partial<Record<number, ErrorCode>>
> = {
  [HttpStatus.BAD_REQUEST]: ErrorCode.BAD_REQUEST,
  [HttpStatus.UNAUTHORIZED]: ErrorCode.UNAUTHORIZED,
  [HttpStatus.FORBIDDEN]: ErrorCode.FORBIDDEN,
  [HttpStatus.NOT_FOUND]: ErrorCode.NOT_FOUND,
  [HttpStatus.METHOD_NOT_ALLOWED]: ErrorCode.METHOD_NOT_ALLOWED,
  [HttpStatus.CONFLICT]: ErrorCode.CONFLICT,
  [HttpStatus.PAYLOAD_TOO_LARGE]: ErrorCode.PAYLOAD_TOO_LARGE,
  [HttpStatus.UNSUPPORTED_MEDIA_TYPE]: ErrorCode.UNSUPPORTED_MEDIA_TYPE,
  [HttpStatus.TOO_MANY_REQUESTS]: ErrorCode.RATE_LIMITED,
};

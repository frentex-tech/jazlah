import { ErrorCode } from '../errors/error-code.enum';

/** The authentication errors of every customer endpoint. */
export const CUSTOMER_AUTH_ERRORS = [
  ErrorCode.UNAUTHORIZED,
  ErrorCode.ACCESS_TOKEN_EXPIRED,
  ErrorCode.FORBIDDEN,
  ErrorCode.RATE_LIMITED,
] as const;

import { ErrorCode } from '../errors/error-code.enum';

/** The authentication errors of every kitchen endpoint. */
export const KITCHEN_AUTH_ERRORS = [
  ErrorCode.UNAUTHORIZED,
  ErrorCode.ACCESS_TOKEN_EXPIRED,
  ErrorCode.FORBIDDEN,
  ErrorCode.RATE_LIMITED,
] as const;

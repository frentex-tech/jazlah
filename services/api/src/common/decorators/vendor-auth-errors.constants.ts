import { ErrorCode } from '../errors/error-code.enum';

/**
 * The authentication errors of every vendor endpoint: the token checks, and
 * VENDOR_SUSPENDED from the organisation status guard.
 */
export const VENDOR_AUTH_ERRORS = [
  ErrorCode.UNAUTHORIZED,
  ErrorCode.ACCESS_TOKEN_EXPIRED,
  ErrorCode.FORBIDDEN,
  ErrorCode.VENDOR_SUSPENDED,
  ErrorCode.RATE_LIMITED,
] as const;

import { ErrorCode } from '@common/errors/error-code.enum';

/** The authentication errors of every admin endpoint. */
export const ADMIN_AUTH_ERRORS = [
  ErrorCode.UNAUTHORIZED,
  ErrorCode.ACCESS_TOKEN_EXPIRED,
  ErrorCode.FORBIDDEN,
  ErrorCode.RATE_LIMITED,
] as const;

import type { Audience } from '@common/auth/audience.type';

/** Injection token of the OtpRequestLimit. */
export const OTP_REQUEST_LIMIT = Symbol('OTP_REQUEST_LIMIT');

/**
 * How many codes one phone may be sent for one audience. Each audience counts on its
 * own, so requests for one audience never lock the phone out of another.
 */
export interface OtpRequestLimit {
  /**
   * Counts one request for the phone and audience. Throws RATE_LIMITED (with the time
   * to wait) when it is over a limit, and SERVICE_UNAVAILABLE when the request cannot
   * be counted: an uncounted code request is never let through. Counted the same
   * whether or not the phone holds access to a staff audience.
   */
  consume(phone: string, audience: Audience): Promise<void>;
}

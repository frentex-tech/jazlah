/** Injection token of the OtpRequestLimit. */
export const OTP_REQUEST_LIMIT = Symbol('OTP_REQUEST_LIMIT');

/** How many codes one phone may be sent, across every audience. */
export interface OtpRequestLimit {
  /**
   * Counts one request for the phone. Throws RATE_LIMITED (with the time to wait) when
   * the phone is over a limit, and SERVICE_UNAVAILABLE when the request cannot be
   * counted: an uncounted code request is never let through.
   */
  consume(phone: string): Promise<void>;
}

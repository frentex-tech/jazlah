/** Injection token of the OtpSender. */
export const OTP_SENDER = Symbol('OTP_SENDER');

/** Delivers a verification message to a phone. */
export interface OtpSender {
  /** Rejects when the message could not be sent. */
  send(phone: string, text: string): Promise<void>;
}

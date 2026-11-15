import type { SmsMessage, SmsSent } from './sms.types';

/**
 * The injection token of the sms providers: an array of SmsPort, in the order
 * SMS_PROVIDERS lists them, which is the order the service tries them.
 */
export const SMS_PORTS = Symbol('SMS_PORTS');

/**
 * What the API needs from an SMS vendor, and nothing more: send one text to one number.
 * No bulk sending, scheduling or templates. Inject the SmsService rather than the
 * port, unless you are a provider's test.
 */
export interface SmsPort {
  /** The provider's name, as SMS_PROVIDERS lists it. */
  readonly name: string;

  /**
   * Sends `message` once. Resolves when the provider accepted it; rejects with an
   * SmsError (`sms.errors.ts`) whose reason the provider mapped from the vendor's
   * documented error. Never retries and knows nothing of other providers. `signal`
   * aborts when the service stops waiting (SMS_PROVIDER_TIMEOUT_MS): pass it to the
   * HTTP call.
   */
  send(message: SmsMessage, signal: AbortSignal): Promise<SmsSent>;
}

// The arguments and results of the sms port and service, in our terms: no vendor field
// appears here.

import type { SmsError } from './sms.errors';

/** What the service is asked to send: one text to one phone number. */
export type SendSmsRequest = Readonly<{
  /** A Saudi mobile number in any form `normalizeSaudiMobileNumber` accepts. */
  to: string;
  /** The message text. Never logged by the service. */
  text: string;
}>;

/** What a provider is given: the number already normalised. */
export type SmsMessage = Readonly<{
  /** A Saudi mobile number in E.164: `+9665XXXXXXXX`. */
  to: string;
  text: string;
}>;

/** A message a provider accepted. */
export type SmsSent = Readonly<{
  /** The provider that accepted it, as SMS_PROVIDERS names it (`fake` in tests). */
  provider: string;
  /** The provider's id for the message. */
  messageId: string;
}>;

/**
 * Why sending failed, for logs and the fallback decision; clients see only the error
 * code.
 *
 * Retryable, so the next provider is tried:
 * - `unavailable`: unreachable, connection lost, or a 5xx.
 * - `timeout`: no answer within SMS_PROVIDER_TIMEOUT_MS.
 * - `throttled`: the provider asked us to slow down.
 * - `unknown`: an error the provider's documentation does not list.
 *
 * Not retryable, so no other provider is tried:
 * - `invalid-number`: the provider refused the number.
 * - `sender-rejected`: the sender name is missing, not activated or refused.
 * - `invalid-message`: the text is empty, too long or refused.
 * - `insufficient-balance`: the account cannot pay for the message.
 */
export type SmsFailureReason =
  | 'unavailable'
  | 'timeout'
  | 'throttled'
  | 'unknown'
  | 'invalid-number'
  | 'sender-rejected'
  | 'invalid-message'
  | 'insufficient-balance';

/** One provider's failed attempt, in SmsNotSentError. */
export type SmsProviderFailure = Readonly<{
  provider: string;
  error: SmsError;
}>;

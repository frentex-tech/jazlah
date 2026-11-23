import { AppError } from '@common/errors/app-error';
import { ErrorCode } from '@common/errors/error-code.enum';
import type { SmsFailureReason, SmsProviderFailure } from './sms.types';

const RETRYABLE_REASONS: readonly SmsFailureReason[] = [
  'unavailable',
  'timeout',
  'throttled',
  'unknown',
];

/** Whether another provider, or a later attempt, can succeed after this reason. */
function isRetryable(reason: SmsFailureReason): boolean {
  return RETRYABLE_REASONS.includes(reason);
}

/**
 * One sending attempt failed, or the message was refused before any provider was
 * called (`invalid-number`, `invalid-message`). `retryable` decides fallback: the
 * service moves to the next provider only when it is true. Clients see
 * SERVICE_UNAVAILABLE (503) when retryable, INTERNAL_ERROR (500) when not. `reason` is
 * for logs (it is in the message, which only the log shows). Providers map every
 * documented vendor error to one, and anything else to `unknown`.
 */
export class SmsError extends AppError {
  readonly reason: SmsFailureReason;
  readonly retryable: boolean;

  constructor(reason: SmsFailureReason, options: { cause?: unknown } = {}) {
    const retryable = isRetryable(reason);
    super(
      retryable ? ErrorCode.SERVICE_UNAVAILABLE : ErrorCode.INTERNAL_ERROR,
      { cause: options.cause },
    );
    this.reason = reason;
    this.retryable = retryable;
    this.message = `${this.code}: sms ${reason}`;
  }
}

/**
 * Every provider tried failed: the last one with a non-retryable error, or each with a
 * retryable one. `failures` holds every attempt in order, each provider's SmsError
 * carrying its original cause; the message names them all (`log timeout, other
 * invalid-number`), and `cause` is the last failure. `retryable` is the last failure's:
 * true only when every provider failed retryably, so a later attempt may succeed.
 */
export class SmsNotSentError extends AppError {
  readonly failures: readonly SmsProviderFailure[];
  readonly retryable: boolean;

  constructor(failures: readonly SmsProviderFailure[]) {
    const last = failures.at(-1)?.error;
    const retryable = last?.retryable ?? false;
    super(
      retryable ? ErrorCode.SERVICE_UNAVAILABLE : ErrorCode.INTERNAL_ERROR,
      { cause: last },
    );
    this.failures = failures;
    this.retryable = retryable;
    const causes = failures
      .map(({ provider, error }) => `${provider} ${error.reason}`)
      .join(', ');
    this.message = `${this.code}: sms not sent: ${causes}`;
  }
}

/**
 * The sms integration cannot start: its configuration names no provider. Thrown while
 * the application starts, never to a client.
 */
export class SmsConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SmsConfigurationError';
  }
}

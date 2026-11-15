import { AppError } from '@common/errors/app-error';
import { ErrorCode } from '@common/errors/error-code.enum';
import type { StorageFailureReason } from './storage.types';

const RETRYABLE_REASONS: readonly StorageFailureReason[] = [
  'unavailable',
  'throttled',
];

/**
 * A storage call failed. `retryable` says whether trying the same call again later can
 * succeed (a job retries it; a client sees SERVICE_UNAVAILABLE and may resend). Clients
 * see SERVICE_UNAVAILABLE (503) when retryable, INTERNAL_ERROR (500) when not: neither
 * is the client's fault. `reason` is for logs (it is in the message, which only the log
 * shows). Providers map every vendor error to one.
 */
export class StorageError extends AppError {
  readonly reason: StorageFailureReason;
  readonly retryable: boolean;

  constructor(reason: StorageFailureReason, options: { cause?: unknown } = {}) {
    const retryable = RETRYABLE_REASONS.includes(reason);
    super(
      retryable ? ErrorCode.SERVICE_UNAVAILABLE : ErrorCode.INTERNAL_ERROR,
      { cause: options.cause },
    );
    this.reason = reason;
    this.retryable = retryable;
    // Logged (never sent: clients get the catalogue message), so the log names the reason.
    this.message = `${this.code}: storage ${reason}`;
  }
}

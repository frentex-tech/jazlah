import type { AppErrorOptions } from './app-error-options.interface';
import type { ErrorCode } from './error-code.enum';
import { ERROR_STATUSES } from './error-statuses.constants';

/**
 * The one error class business code throws. Subclass it for a family of errors;
 * never throw a raw Error or a Nest HttpException for something a client can see.
 * The global exception filter turns it into `{ code, message, details?, requestId }`.
 */
export class AppError extends Error {
  readonly code: ErrorCode;
  /** An HTTP status code. */
  readonly status: number;
  readonly details?: unknown;

  constructor(code: ErrorCode, options: AppErrorOptions = {}) {
    super(code, { cause: options.cause });
    this.name = new.target.name;
    this.code = code;
    this.status = options.status ?? ERROR_STATUSES[code];
    this.details = options.details;
  }
}

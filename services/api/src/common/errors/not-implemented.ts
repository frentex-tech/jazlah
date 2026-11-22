import { AppError } from './app-error';
import { ErrorCode } from './error-code.enum';

/**
 * The answer of a route that is in the API contract before its task lands:
 * NOT_IMPLEMENTED (501) with the task key, so clients can show "coming soon".
 * The route's own arguments are passed through only to keep the signature the
 * contract documents; they are ignored.
 */
export function notImplemented(
  task: string,
  ...ignored: unknown[]
): Promise<never> {
  void ignored;
  return Promise.reject(
    new AppError(ErrorCode.NOT_IMPLEMENTED, { details: { task } }),
  );
}

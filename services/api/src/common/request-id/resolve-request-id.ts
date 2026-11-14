import { randomUUID } from 'node:crypto';
import {
  REQUEST_ID_MAX_LENGTH,
  REQUEST_ID_PATTERN,
} from './request-id.constants';

/**
 * Returns the incoming request id when it is safe to reuse (one value, bounded
 * length, safe characters); otherwise a new UUID.
 */
export function resolveRequestId(
  incoming: string | string[] | undefined,
): string {
  if (
    typeof incoming === 'string' &&
    incoming.length > 0 &&
    incoming.length <= REQUEST_ID_MAX_LENGTH &&
    REQUEST_ID_PATTERN.test(incoming)
  ) {
    return incoming;
  }
  return randomUUID();
}

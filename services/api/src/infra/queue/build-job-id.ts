import { InvalidJobIdError } from './invalid-job-id.error';

const OPERATION_PATTERN = /^[a-z][a-z0-9-]*$/;
const SEPARATOR = '.';

/**
 * Builds a deterministic job id from an operation name and the input that identifies
 * one run of it: `buildJobId('payment-webhook', 'geidea', eventId)` gives
 * `payment-webhook.geidea.<eventId>`.
 *
 * Pass it as `jobId` when an operation must not be enqueued twice for the same input
 * (one payment webhook, one invoice submission). What that gives, exactly:
 *
 * - BullMQ ignores an `add` whose id exists in the queue: while the job is waiting,
 *   delayed or active, and while it is kept after it ended (`removeOnComplete`: 1 day,
 *   at most 1,000; `removeOnFail`: 14 days, in `default-job-options.constants.ts`).
 * - A failed job blocks re-adding the id until it is removed.
 * - Once removed, the same id enqueues again.
 * - It never makes the work happen once: retries, stalled jobs and cancelled jobs run it
 *   again. Work that must happen exactly once keys itself in the database with
 *   `IdempotencyRunner` (`src/infra/database/idempotency-runner.ts`).
 *
 * Do not use it for work that may legitimately run again with the same input (a
 * reminder sent every day): that gets BullMQ's generated id.
 *
 * - `operation`: kebab-case, starting with a letter, so the id is never all digits
 *   (BullMQ rejects those).
 * - `parts`: one or more identifying values (ids, not records). Each is percent-encoded,
 *   and `.` too, so no part can contain the separator or Redis's `:`, and two
 *   different inputs never give the same id.
 */
export function buildJobId(
  operation: string,
  ...parts: readonly (string | number)[]
): string {
  if (!OPERATION_PATTERN.test(operation)) {
    throw new InvalidJobIdError(
      'the operation must be kebab-case and start with a letter',
    );
  }
  if (parts.length === 0) {
    throw new InvalidJobIdError('give at least one identifying part');
  }
  const encoded = parts.map((part) => {
    const text = String(part);
    if (text === '') {
      throw new InvalidJobIdError('a part is empty');
    }
    return encodeURIComponent(text).replaceAll('.', '%2E');
  });
  return [operation, ...encoded].join(SEPARATOR);
}

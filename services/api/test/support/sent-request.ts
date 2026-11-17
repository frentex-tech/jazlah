import type { Response, Test } from 'supertest';

/** A request sent now, its response read later; `done` once it has answered. */
export type SentRequest = { done: boolean; response: Promise<Response> };

/**
 * Sends `test` at once and tracks it, for a test that holds a row lock: pass
 * `() => sent.done` as `waitForWaiters`' `orWhen`, so a request that answers instead of
 * waiting ends the wait rather than its timeout.
 */
export function sent(test: Test): SentRequest {
  const tracked: SentRequest = {
    done: false,
    response: test.then((res) => {
      tracked.done = true;
      return res;
    }),
  };
  return tracked;
}

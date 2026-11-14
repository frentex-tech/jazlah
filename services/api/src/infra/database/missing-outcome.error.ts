/**
 * Thrown by `IdempotencyRunner.runOnce` when a committed key has no outcome, which the
 * runner never writes (claim and outcome commit together): the row was changed by hand
 * or by other code. Internal: never sent to a client.
 */
export class MissingOutcomeError extends Error {
  constructor(operation: string) {
    super(`The idempotency key of "${operation}" has no stored outcome`);
    this.name = 'MissingOutcomeError';
  }
}

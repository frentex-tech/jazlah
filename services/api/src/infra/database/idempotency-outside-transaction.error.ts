/**
 * Thrown by `IdempotencyRunner.runOnce` when no transaction is open: the key and the
 * work's effects must commit together, so the call belongs inside
 * `TransactionRunner.run`. A programming error: never sent to a client.
 */
export class IdempotencyOutsideTransactionError extends Error {
  constructor(operation: string) {
    super(
      `runOnce("${operation}", ...) was called outside a transaction: call it inside TransactionRunner.run`,
    );
    this.name = 'IdempotencyOutsideTransactionError';
  }
}

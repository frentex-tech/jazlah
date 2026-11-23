/**
 * A query inside a transaction failed, the work caught the error and returned normally,
 * and so the transaction was rolled back instead of committed. Internal: a programming
 * error, sent to the client as INTERNAL_ERROR. Its `cause` is the query error.
 *
 * Fix the code that caught the error: a database error ends the transaction
 * (`.claude/rules/database.md`, "Transactions").
 */
export class TransactionAbortedError extends Error {
  constructor(cause: unknown) {
    super(
      'A query in this transaction failed and the error was caught; the transaction was rolled back, not committed',
      { cause },
    );
    this.name = 'TransactionAbortedError';
  }
}

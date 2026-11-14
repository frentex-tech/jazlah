/**
 * Where a transaction scope is in its life (`TransactionScope.state`): `open` while its
 * work runs, then `committed` or `rolled-back`. Code that kept the async context of a
 * finished transaction (a timer or a promise started inside it) still sees its scope, so
 * `runAfterCommit` reads the state instead of assuming the transaction is open.
 */
export type TransactionState = 'open' | 'committed' | 'rolled-back';

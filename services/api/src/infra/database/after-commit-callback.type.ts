/**
 * Work to run once a transaction commits (`runAfterCommit`). What it returns is
 * ignored, except a promise: its rejection is logged like a thrown error, and nothing
 * waits for it.
 */
export type AfterCommitCallback = () => unknown;

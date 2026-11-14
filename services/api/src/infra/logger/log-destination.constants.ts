/**
 * Injection token of the stream log lines are written to. Unset (null): standard output.
 * e2e tests that check what is logged provide a stream that captures the lines.
 */
export const LOG_DESTINATION = Symbol('LOG_DESTINATION');

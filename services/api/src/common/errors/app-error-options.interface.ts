export interface AppErrorOptions {
  /** Overrides the status the code normally takes (error-statuses.constants.ts). */
  status?: number;
  /** Sent to the client as `details`. Never put secrets or personal data here. */
  details?: unknown;
  /** The underlying error. Logged, never sent to the client. */
  cause?: unknown;
}

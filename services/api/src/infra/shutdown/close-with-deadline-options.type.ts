import type { ClosingResources } from './closing-resources';
import type { ShutdownLogger } from './shutdown-logger.type';

export interface CloseWithDeadlineOptions {
  /** How long the whole shutdown may take (SHUTDOWN_DEADLINE_MS). */
  deadlineMs: number;
  logger: ShutdownLogger;
  /** Ends the process: `process.exit` in main.ts, a recorder in tests. */
  exit: (code: number) => void;
  /** Where the names of closing resources are read; the process's list by default. */
  resources?: ClosingResources;
}

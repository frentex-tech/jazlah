/** The fields on every log line about a job. */
export type JobLogContext = Readonly<{
  queue: string;
  jobName: string;
  jobId: string | undefined;
  /** This run's number, from 1. */
  attempt: number;
  maxAttempts: number;
}>;

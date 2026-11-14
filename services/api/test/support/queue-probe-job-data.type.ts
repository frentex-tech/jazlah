/** The payload of a probe job: an id to record, as real payloads carry ids, not records. */
export type QueueProbeJobData = Readonly<{
  key: string;
  /** For `slow` jobs: how long the work takes. */
  durationMs?: number;
}>;

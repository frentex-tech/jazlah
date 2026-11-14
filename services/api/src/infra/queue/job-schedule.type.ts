/** A job that runs every `everyMs`, registered with `keepJobScheduled`. */
export type JobSchedule = Readonly<{
  /** Identifies the schedule in its queue: registering it again replaces it. */
  schedulerId: string;
  /** The name of each job it produces, which the processor receives. */
  jobName: string;
  everyMs: number;
}>;

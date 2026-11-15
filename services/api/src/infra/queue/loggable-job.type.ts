import type { Job } from 'bullmq';

/** The parts of a BullMQ job that its log lines use. Never the job's data. */
export type LoggableJob = Pick<
  Job,
  | 'queueName'
  | 'name'
  | 'id'
  | 'attemptsMade'
  | 'opts'
  | 'processedOn'
  | 'finishedOn'
>;

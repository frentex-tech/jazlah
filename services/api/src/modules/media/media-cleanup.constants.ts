/** The repeating job that removes unconfirmed uploads (`media-cleanup.processor.ts`). */
export const MEDIA_CLEANUP = {
  schedulerId: 'media-cleanup',
  jobName: 'remove-expired-uploads',
  /** How many expired uploads one pass removes before it looks for more. */
  batchSize: 100,
} as const;

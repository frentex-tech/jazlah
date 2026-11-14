import { Processor } from '@nestjs/bullmq';
import type { Job } from 'bullmq';
import { JobProcessor } from '@infra/queue/job-processor';
import { QUEUE_NAMES } from '@infra/queue/queue-names.constants';
import { MediaService } from './media.service';

/**
 * Runs the media-cleanup job (scheduled by MediaCleanupScheduler): removes uploads not
 * confirmed in time. An entry point only: MediaService.removeExpiredUploads holds the
 * rule and is idempotent, so a retry, a stalled job or two instances at once remove
 * each upload once. The job carries no payload; its result is how many were removed.
 */
@Processor(QUEUE_NAMES.mediaCleanup)
export class MediaCleanupProcessor extends JobProcessor<unknown, number> {
  constructor(private readonly media: MediaService) {
    super();
  }

  protected handle(
    _job: Job<unknown, number>,
    signal: AbortSignal,
  ): Promise<number> {
    return this.media.removeExpiredUploads(signal);
  }
}

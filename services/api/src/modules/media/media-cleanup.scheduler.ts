import { InjectQueue } from '@nestjs/bullmq';
import {
  Inject,
  Injectable,
  Logger,
  type OnApplicationBootstrap,
  type OnModuleDestroy,
} from '@nestjs/common';
import type { Queue } from 'bullmq';
import { mediaConfig } from '@config/media.config';
import type { MediaConfig } from '@config/media-config.type';
import type { JobScheduleHandle } from '@infra/queue/job-schedule-handle.type';
import { keepJobScheduled } from '@infra/queue/keep-job-scheduled';
import { QUEUE_NAMES } from '@infra/queue/queue-names.constants';
import { MEDIA_CLEANUP } from './media-cleanup.constants';

/**
 * Keeps the media-cleanup job scheduled every MEDIA_CLEANUP_INTERVAL_SECONDS. The
 * schedule lives in Redis, shared by every instance; registering it at each start
 * replaces it (a changed interval applies), and a Redis outage at startup only delays
 * it (`keepJobScheduled`).
 */
@Injectable()
export class MediaCleanupScheduler
  implements OnApplicationBootstrap, OnModuleDestroy
{
  private readonly logger = new Logger(MediaCleanupScheduler.name);
  private schedule: JobScheduleHandle | undefined;

  constructor(
    @InjectQueue(QUEUE_NAMES.mediaCleanup) private readonly queue: Queue,
    @Inject(mediaConfig.KEY) private readonly config: MediaConfig,
  ) {}

  onApplicationBootstrap(): void {
    this.schedule = keepJobScheduled(
      this.queue,
      {
        schedulerId: MEDIA_CLEANUP.schedulerId,
        jobName: MEDIA_CLEANUP.jobName,
        everyMs: this.config.cleanupIntervalSeconds * 1_000,
      },
      this.logger,
    );
  }

  onModuleDestroy(): void {
    this.schedule?.stop();
  }

  /** Resolves once the schedule is registered in Redis (tests wait on it). */
  whenRegistered(): Promise<void> {
    return (
      this.schedule?.registered ??
      Promise.reject(new Error('the media cleanup schedule was not started'))
    );
  }
}

import { Processor } from '@nestjs/bullmq';
import type { OnApplicationBootstrap } from '@nestjs/common';
import { DelayedError, type Job } from 'bullmq';
import { PrismaService } from '@infra/database/prisma.service';
import { JobProcessor } from '@infra/queue/job-processor';
import type { QueueProbeJobData } from './queue-probe-job-data.type';
import { PROBE_QUEUES } from './queue-probe.constants';

/**
 * A test-only processor, written the way a module's processor is. By job name:
 * - `succeed`: records the key.
 * - `fail`: always throws, so the job is retried until its attempts run out.
 * - `slow`: waits `durationMs`, then queries the database (proving the connection is
 *   still open while a job finishes during shutdown), then records the key.
 * - `delay`: on its first run moves itself to the delayed set and throws DelayedError
 *   (BullMQ's way to postpone a job without failing it); on the next run records the key.
 *
 * It also overrides `onApplicationBootstrap`, the hook in which the job logging used to
 * be attached, to show that a processor cannot remove the logging that way.
 */
@Processor(PROBE_QUEUES.probe)
export class QueueProbeProcessor
  extends JobProcessor<QueueProbeJobData, string>
  implements OnApplicationBootstrap
{
  /** The keys of the jobs that ran to the end, in order. */
  readonly completedKeys: string[] = [];
  /** The keys of the `delay` jobs already postponed once. */
  private readonly postponed = new Set<string>();

  constructor(private readonly prisma: PrismaService) {
    super();
  }

  onApplicationBootstrap(): void {
    // Deliberately empty: see the class comment.
  }

  protected async handle(job: Job<QueueProbeJobData, string>): Promise<string> {
    if (job.name === 'delay' && !this.postponed.has(job.data.key)) {
      this.postponed.add(job.data.key);
      await job.moveToDelayed(Date.now() + 50, job.token);
      throw new DelayedError();
    }
    if (job.name === 'fail') {
      throw new Error('probe failure');
    }
    if (job.name === 'slow') {
      await new Promise((resolve) => setTimeout(resolve, job.data.durationMs));
      await this.prisma.$queryRaw`SELECT 1`;
    }
    this.completedKeys.push(job.data.key);
    return `done:${job.data.key}`;
  }
}

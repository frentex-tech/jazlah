import { Processor } from '@nestjs/bullmq';
import { JobProcessor } from '@infra/queue/job-processor';
import { PROBE_QUEUES } from './queue-probe.constants';

/**
 * A test-only processor whose jobs never finish by themselves and ignore their abort
 * signal, with a 300 ms shutdown timeout: it shows that shutdown is bounded. The test
 * calls `release()` afterwards so no work is left pending.
 */
@Processor(PROBE_QUEUES.stuck)
export class StuckProbeProcessor extends JobProcessor<unknown, void> {
  protected override readonly shutdownTimeoutMs = 300;
  private readonly releases: (() => void)[] = [];

  protected handle(): Promise<void> {
    return new Promise<void>((resolve) => {
      this.releases.push(resolve);
    });
  }

  /** Lets every abandoned job's work finish. */
  release(): void {
    for (const resolve of this.releases.splice(0)) {
      resolve();
    }
  }
}

import type { LoggerService } from '@nestjs/common';
import type { Queue } from 'bullmq';
import { withTimeout } from '@common/async/with-timeout';
import type { JobScheduleHandle } from './job-schedule-handle.type';
import type { JobSchedule } from './job-schedule.type';
import {
  QUEUE_SCHEDULE_MAX_RETRY_MS,
  QUEUE_SCHEDULE_RETRY_MS,
  QUEUE_SCHEDULE_TIMEOUT_MS,
} from './queue.constants';

/**
 * Registers a repeating job on `queue` (a BullMQ job scheduler, stored in Redis and
 * shared by every instance: registering it again, from any instance, replaces it and
 * never doubles it), without holding up startup.
 *
 * Call it from `onApplicationBootstrap` and call the handle's `stop` from
 * `onModuleDestroy`. Each attempt is bounded by QUEUE_SCHEDULE_TIMEOUT_MS (BoundedQueue
 * bounds adds only). A failed attempt (Redis unavailable) is logged as a warning and
 * retried after QUEUE_SCHEDULE_RETRY_MS, doubling up to QUEUE_SCHEDULE_MAX_RETRY_MS,
 * until it succeeds (`registered` resolves) or `stop` is called. A schedule registered by an
 * earlier start keeps producing jobs meanwhile.
 *
 * The jobs it produces have no payload and BullMQ's generated ids; their processor must
 * be idempotent like any other (`.claude/rules/modules.md`, "Jobs").
 */
export function keepJobScheduled(
  queue: Queue,
  schedule: JobSchedule,
  logger: LoggerService,
): JobScheduleHandle {
  let stopped = false;
  let markRegistered: () => void = () => undefined;
  const registered = new Promise<void>((resolve) => {
    markRegistered = resolve;
  });
  let timer: NodeJS.Timeout | undefined;
  let retryMs = QUEUE_SCHEDULE_RETRY_MS;

  const attempt = (): void => {
    void withTimeout(
      queue.upsertJobScheduler(
        schedule.schedulerId,
        { every: schedule.everyMs },
        { name: schedule.jobName },
      ),
      QUEUE_SCHEDULE_TIMEOUT_MS,
    ).then(
      () => {
        logger.log(
          { queue: queue.name, schedulerId: schedule.schedulerId },
          'Job schedule registered',
        );
        markRegistered();
      },
      (error: unknown) => {
        if (stopped) {
          return;
        }
        logger.warn(
          {
            err: error,
            queue: queue.name,
            schedulerId: schedule.schedulerId,
            retryMs,
          },
          'Could not register the job schedule; retrying',
        );
        timer = setTimeout(attempt, retryMs);
        // The retry alone must not keep the process alive.
        timer.unref();
        retryMs = Math.min(retryMs * 2, QUEUE_SCHEDULE_MAX_RETRY_MS);
      },
    );
  };

  attempt();
  return {
    registered,
    stop: () => {
      stopped = true;
      clearTimeout(timer);
    },
  };
}

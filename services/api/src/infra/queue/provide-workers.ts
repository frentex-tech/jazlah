import type { Provider, Type } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { queueConfig } from '@config/queue.config';
import type { QueueConfig } from '@config/queue-config.type';

/**
 * What a worker-side provider is in a process that runs no workers: a plain object, so
 * it carries no @Processor metadata (no BullMQ worker is created) and no lifecycle hook
 * (a scheduler registers nothing).
 */
const NOT_STARTED = Object.freeze({});

/**
 * The providers that make a process a queue worker: a module's processors and the
 * schedulers that keep their repeating jobs registered. List them here instead of in
 * `providers` directly:
 *
 * ```ts
 * providers: [MediaService, ...provideWorkers(MediaCleanupProcessor, MediaCleanupScheduler)]
 * ```
 *
 * When QUEUE_WORKERS_ENABLED is true each one is created as usual, with its
 * dependencies from the module; when false each is replaced by an inert object, so the
 * process opens no worker connection and schedules nothing. Producers (the queues and
 * whatever adds jobs) are registered as usual either way.
 *
 * How it works: @nestjs/bullmq finds processors by the class of each provider's
 * instance (for a factory provider, the instance the factory returned), and Nest calls
 * lifecycle hooks on that instance; the inert object has neither. A test turns on one
 * worker with `.overrideProvider(Worker).useClass(Worker)` (`test/support/`).
 *
 * Why: production runs API and worker processes separately, so job load at peak times
 * never slows API responses (`.claude/DECISIONS.md`, "Workers by role").
 */
export function provideWorkers(...workers: Type[]): Provider[] {
  return workers.map((worker) => ({
    provide: worker,
    inject: [queueConfig.KEY, ModuleRef],
    useFactory: (config: QueueConfig, moduleRef: ModuleRef): Promise<object> =>
      config.workersEnabled
        ? moduleRef.create(worker)
        : Promise.resolve(NOT_STARTED),
  }));
}

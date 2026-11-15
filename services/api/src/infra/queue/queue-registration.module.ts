import {
  BullModule,
  getQueueToken,
  type RegisterQueueOptions,
} from '@nestjs/bullmq';
import { type DynamicModule, Logger, Module } from '@nestjs/common';
import type { Queue } from 'bullmq';
import { BoundedQueue } from './bounded-queue';
import { logQueueErrors } from './log-queue-errors';

const logger = new Logger('Queue');

/**
 * The one way to register a queue (lint rule R15 refuses `BullModule.registerQueue`
 * anywhere else). A module imports
 * `QueueRegistrationModule.register({ name: QUEUE_NAMES.<key> })` and injects the queue
 * with `@InjectQueue(QUEUE_NAMES.<key>)`.
 *
 * Besides registering the queue with `@nestjs/bullmq`:
 * - every queue is a `BoundedQueue`, so adding a job fails fast with
 *   SERVICE_UNAVAILABLE when Redis is unavailable instead of waiting without limit;
 * - it sends the queue's `error` events to the application logger
 *   (`logQueueErrors`), so a Redis outage never reaches the console.
 */
@Module({})
export class QueueRegistrationModule {
  static register(...queues: RegisterQueueOptions[]): DynamicModule {
    // @nestjs/bullmq reads its queue class when registerQueue builds the providers; every
    // queue is registered here (R15), so all of them are bounded.
    BullModule.queueClass = BoundedQueue;
    const bull = BullModule.registerQueue(...queues);
    const names = queues.map((queue) => queue.name ?? 'default');
    return {
      module: QueueRegistrationModule,
      imports: [bull],
      providers: [
        {
          provide: `queue-error-listeners:${names.join(',')}`,
          inject: names.map((name) => getQueueToken(name)),
          useFactory: (...registered: Queue[]) => {
            for (const queue of registered) {
              logQueueErrors(queue, logger);
            }
            return registered.length;
          },
        },
      ],
      exports: [bull],
    };
  }
}

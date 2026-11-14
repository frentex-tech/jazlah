import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { redisConfig } from '@config/redis.config';
import type { RedisConfig } from '@config/redis-config.type';
import { DEFAULT_JOB_OPTIONS } from './default-job-options.constants';
import { QUEUE_KEY_PREFIX } from './queue.constants';

/**
 * Registers BullMQ once for the whole application: the Redis connection from the
 * `redis` config, the key prefix and the default job options.
 *
 * BullMQ opens its own connections from these options for every queue and worker
 * (workers retry commands without limit; queues fail fast). The shared RedisService is
 * not reused for them. Workers close in `onModuleDestroy`, letting active jobs finish
 * (`JobProcessor` bounds the wait); queues close in `onApplicationShutdown`.
 *
 * No queue is registered here: a module registers its own queue with
 * `BullModule.registerQueue({ name: QUEUE_NAMES.<key> })` and keeps its processor.
 */
@Module({
  imports: [
    BullModule.forRootAsync({
      inject: [redisConfig.KEY],
      useFactory: (config: RedisConfig) => ({
        // BullMQ hands the URL to ioredis for each connection it opens.
        connection: { url: config.url },
        prefix: QUEUE_KEY_PREFIX,
        defaultJobOptions: DEFAULT_JOB_OPTIONS,
      }),
    }),
  ],
})
export class QueueModule {}

import type { INestApplication, Type } from '@nestjs/common';
import { getQueueToken } from '@nestjs/bullmq';
import { Test } from '@nestjs/testing';
import type { Queue } from 'bullmq';
import { loadEnv } from '@config/load-env';
import { queueConfig } from '@config/queue.config';
import { redisConfig } from '@config/redis.config';
import { provideWorkers } from '@infra/queue/provide-workers';
import { QueueRegistrationModule } from '@infra/queue/queue-registration.module';
import { AppModule } from '../../src/app.module';
import { enableWorkers } from './enable-workers';
import { PROBE_JOB_OPTIONS, PROBE_QUEUES } from './queue-probe.constants';
import { QueueProbeProcessor } from './queue-probe.processor';
import { StalledProbeProcessor } from './stalled-probe.processor';
import { StuckProbeProcessor } from './stuck-probe.processor';

/**
 * The real application plus the test-only probe queues and processors, registered the
 * way a module registers its own (`provideWorkers`). No worker runs, the probes' and the
 * application's alike (QUEUE_WORKERS_ENABLED is false in e2e runs), except those listed
 * in `workers`. `redisUrl` replaces REDIS_URL (for example a TCP proxy the test can stop).
 * `workersEnabledByConfig` instead turns every worker on the way production does:
 * QUEUE_WORKERS_ENABLED true in the queue config and no test override, so each worker
 * comes from `provideWorkers`' factory (the application's own workers start too).
 * Returns once the probe queues are connected.
 */
export async function createQueueProbeApp(
  options: Readonly<{
    redisUrl?: string;
    workers?: readonly Type[];
    workersEnabledByConfig?: boolean;
  }> = {},
): Promise<INestApplication> {
  let builder = Test.createTestingModule({
    imports: [
      AppModule,
      QueueRegistrationModule.register(
        { name: PROBE_QUEUES.probe, defaultJobOptions: PROBE_JOB_OPTIONS },
        { name: PROBE_QUEUES.stuck, defaultJobOptions: PROBE_JOB_OPTIONS },
        { name: PROBE_QUEUES.stalled, defaultJobOptions: PROBE_JOB_OPTIONS },
        { name: PROBE_QUEUES.defaults },
      ),
    ],
    providers: provideWorkers(
      QueueProbeProcessor,
      StuckProbeProcessor,
      StalledProbeProcessor,
    ),
  });
  builder = enableWorkers(builder, options.workers ?? []);
  if (options.workersEnabledByConfig === true) {
    builder = builder
      .overrideProvider(queueConfig.KEY)
      .useValue({ ...queueConfig(), workersEnabled: true });
  }
  if (options.redisUrl !== undefined) {
    builder = builder.overrideProvider(redisConfig.KEY).useValue({
      url: options.redisUrl,
      keyPrefix: loadEnv().REDIS_KEY_PREFIX,
    });
  }
  const moduleRef = await builder.compile();
  const app = moduleRef.createNestApplication();
  await app.init();
  // As a load balancer waits for readiness: the probe queues' connections are open
  // before a test adds a job, so the bounded add (QUEUE_ADD_TIMEOUT_MS) measures Redis,
  // not a first connection slowed by every suite starting at once.
  await Promise.all(
    Object.values(PROBE_QUEUES).map((name) =>
      app.get<Queue>(getQueueToken(name)).waitUntilReady(),
    ),
  );
  return app;
}

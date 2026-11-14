import type { INestApplication, Type } from '@nestjs/common';
import { Test } from '@nestjs/testing';
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
 */
export async function createQueueProbeApp(
  options: Readonly<{ redisUrl?: string; workers?: readonly Type[] }> = {},
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
  if (options.redisUrl !== undefined) {
    builder = builder
      .overrideProvider(redisConfig.KEY)
      .useValue({ url: options.redisUrl });
  }
  const moduleRef = await builder.compile();
  const app = moduleRef.createNestApplication();
  await app.init();
  return app;
}

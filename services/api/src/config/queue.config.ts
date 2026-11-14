import { registerAs } from '@nestjs/config';
import { loadEnv } from './load-env';

/**
 * The `queue` namespace: whether this process runs queue workers (processors and
 * schedulers, `provideWorkers`). Producers work either way. Inject with
 * `@Inject(queueConfig.KEY) config: QueueConfig`.
 */
export const queueConfig = registerAs('queue', () => {
  const env = loadEnv();
  return {
    workersEnabled: env.QUEUE_WORKERS_ENABLED,
  };
});

import { registerAs } from '@nestjs/config';
import { loadEnv } from './load-env';

/** The `app` namespace. Inject with `@Inject(appConfig.KEY) config: AppConfig`. */
export const appConfig = registerAs('app', () => {
  const env = loadEnv();
  return {
    nodeEnv: env.NODE_ENV,
    port: env.PORT,
    shutdownDeadlineMs: env.SHUTDOWN_DEADLINE_MS,
  };
});

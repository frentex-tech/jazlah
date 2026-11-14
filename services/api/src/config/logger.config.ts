import { registerAs } from '@nestjs/config';
import { loadEnv } from './load-env';

/** The `logger` namespace. Inject with `@Inject(loggerConfig.KEY) config: LoggerConfig`. */
export const loggerConfig = registerAs('logger', () => {
  const env = loadEnv();
  return {
    level: env.LOG_LEVEL,
  };
});

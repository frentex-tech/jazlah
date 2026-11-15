import { registerAs } from '@nestjs/config';
import { loadEnv } from './load-env';

/**
 * The `redis` namespace. Inject with `@Inject(redisConfig.KEY) config: RedisConfig`.
 * `url` can hold the password: never log it or put it in an error. `keyPrefix` begins
 * every key the API writes (rate limits, queues).
 */
export const redisConfig = registerAs('redis', () => {
  const env = loadEnv();
  return {
    url: env.REDIS_URL,
    keyPrefix: env.REDIS_KEY_PREFIX,
  };
});

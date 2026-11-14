import type { ConfigType } from '@nestjs/config';
import type { redisConfig } from './redis.config';

export type RedisConfig = ConfigType<typeof redisConfig>;

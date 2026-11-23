import type { ConfigType } from '@nestjs/config';
import type { rateLimitConfig } from './rate-limit.config';

export type RateLimitConfig = ConfigType<typeof rateLimitConfig>;

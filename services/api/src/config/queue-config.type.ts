import type { ConfigType } from '@nestjs/config';
import type { queueConfig } from './queue.config';

export type QueueConfig = ConfigType<typeof queueConfig>;

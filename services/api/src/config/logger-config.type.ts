import type { ConfigType } from '@nestjs/config';
import type { loggerConfig } from './logger.config';

export type LoggerConfig = ConfigType<typeof loggerConfig>;

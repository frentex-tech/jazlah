import type { ConfigType } from '@nestjs/config';
import type { appConfig } from './app.config';

export type AppConfig = ConfigType<typeof appConfig>;

import type { ConfigType } from '@nestjs/config';
import type { databaseConfig } from './database.config';

export type DatabaseConfig = ConfigType<typeof databaseConfig>;

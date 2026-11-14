import type { ConfigType } from '@nestjs/config';
import type { storageConfig } from './storage.config';

export type StorageConfig = ConfigType<typeof storageConfig>;

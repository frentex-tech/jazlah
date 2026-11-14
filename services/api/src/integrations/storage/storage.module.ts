import { Module } from '@nestjs/common';
import { storageConfig } from '@config/storage.config';
import type { StorageConfig } from '@config/storage-config.type';
import type { STORAGE_PROVIDERS } from '@config/storage-providers.constants';
import { S3StorageProvider } from './providers/s3.provider';
import { STORAGE_PORT, type StoragePort } from './storage.port';
import { StorageService } from './storage.service';

/**
 * The storage integration. STORAGE_PROVIDER selects the one active provider; there is
 * no fallback (`.claude/rules/integrations.md`, "Storage"). A new vendor is its
 * provider file and test, one entry in PROVIDERS and its name in STORAGE_PROVIDERS.
 *
 * This is the only file that names provider classes. Tests replace the port with the
 * fake from `@integrations/storage/testing`:
 * `.overrideProvider(STORAGE_PORT).useValue(new FakeStorageProvider())`.
 */
@Module({
  providers: [
    {
      provide: STORAGE_PORT,
      inject: [storageConfig.KEY],
      useFactory: (config: StorageConfig): StoragePort =>
        new StorageModule.PROVIDERS[config.provider](config),
    },
    StorageService,
  ],
  exports: [StorageService],
})
export class StorageModule {
  /** The provider class of each STORAGE_PROVIDER value. */
  static readonly PROVIDERS: Readonly<
    Record<
      (typeof STORAGE_PROVIDERS)[number],
      new (config: StorageConfig) => StoragePort
    >
  > = {
    s3: S3StorageProvider,
  };
}

import { Module } from '@nestjs/common';
import { provideWorkers } from '@infra/queue/provide-workers';
import { QueueRegistrationModule } from '@infra/queue/queue-registration.module';
import { QUEUE_NAMES } from '@infra/queue/queue-names.constants';
import { StorageModule } from '@integrations/storage';
import { MEDIA_CLEANUP_SCOPE } from './media-cleanup-scope.constants';
import { MediaCleanupProcessor } from './media-cleanup.processor';
import { MediaCleanupScheduler } from './media-cleanup.scheduler';
import { MediaService } from './media.service';

/**
 * The media module: uploaded files and their lifecycle (MediaService), and the job
 * that removes uploads never confirmed. No controller yet: an upload endpoint needs
 * authentication, which does not exist.
 */
@Module({
  imports: [
    StorageModule,
    QueueRegistrationModule.register({ name: QUEUE_NAMES.mediaCleanup }),
  ],
  providers: [
    MediaService,
    // The cleanup acts on every upload; e2e apps override it with a scope of their own.
    { provide: MEDIA_CLEANUP_SCOPE, useValue: null },
    // Started only in a worker process (QUEUE_WORKERS_ENABLED).
    ...provideWorkers(MediaCleanupProcessor, MediaCleanupScheduler),
  ],
  exports: [MediaService],
})
export class MediaModule {}

import { Module } from '@nestjs/common';
import { provideWorkers } from '@infra/queue/provide-workers';
import { QueueRegistrationModule } from '@infra/queue/queue-registration.module';
import { QUEUE_NAMES } from '@infra/queue/queue-names.constants';
import { StorageModule } from '@integrations/storage';
import { AdminMediaController } from './controllers/admin.controller';
import { CustomerMediaController } from './controllers/customer.controller';
import { VendorMediaController } from './controllers/vendor.controller';
import { MEDIA_CLEANUP_SCOPE } from './media-cleanup-scope.constants';
import { MediaCleanupProcessor } from './media-cleanup.processor';
import { MediaCleanupScheduler } from './media-cleanup.scheduler';
import { MediaService } from './media.service';

/**
 * The media module: uploaded files and their lifecycle (MediaService), the upload
 * endpoints of the customer, vendor and admin audiences (each limited to its own
 * purposes, AUDIENCE_UPLOAD_PURPOSES), and the job that removes uploads never confirmed.
 */
@Module({
  imports: [
    StorageModule,
    QueueRegistrationModule.register({ name: QUEUE_NAMES.mediaCleanup }),
  ],
  controllers: [
    CustomerMediaController,
    VendorMediaController,
    AdminMediaController,
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

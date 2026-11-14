// lint-rule: R15 conforms
import { Module } from '@nestjs/common';
import { QueueRegistrationModule } from '@infra/queue/queue-registration.module';

@Module({ imports: [QueueRegistrationModule.register('catalog-sync')] })
export class CatalogQueueModule {}

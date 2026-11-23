// lint-rule: R15 violates
import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';

@Module({ imports: [BullModule['registerQueue']({ name: 'catalog-sync' })] })
export class CatalogKeyedQueueModule {}

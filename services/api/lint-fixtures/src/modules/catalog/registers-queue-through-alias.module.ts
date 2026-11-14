// lint-rule: R15 violates
import { BullModule as Queues } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';

@Module({ imports: [Queues.registerQueueAsync({ name: 'catalog-sync' })] })
export class CatalogAliasedQueueModule {}

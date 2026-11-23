// lint-rule: R15 violates
import { BullModule } from '@nestjs/bullmq';
import { Module, type DynamicModule } from '@nestjs/common';

const queues: { registerQueue: (options: { name: string }) => DynamicModule } =
  BullModule;
const { registerQueue: register } = queues;

@Module({ imports: [register({ name: 'catalog-sync' })] })
export class CatalogDestructuredQueueModule {}

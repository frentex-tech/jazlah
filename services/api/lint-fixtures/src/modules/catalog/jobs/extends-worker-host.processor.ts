// lint-rule: R17 violates
import { Processor, WorkerHost } from '@nestjs/bullmq';

@Processor('catalog-sync')
export class ExtendsWorkerHostProcessor extends WorkerHost {
  process(): Promise<void> {
    return Promise.resolve();
  }
}

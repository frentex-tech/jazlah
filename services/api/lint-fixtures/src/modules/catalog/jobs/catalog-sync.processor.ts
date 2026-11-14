// lint-rule: R17 R18 conforms
import { Processor } from '@nestjs/bullmq';
import type { Job } from 'bullmq';
import { JobProcessor } from '@infra/queue/job-processor';

@Processor('catalog-sync')
export class CatalogSyncProcessor extends JobProcessor<{ productId: string }> {
  protected handle(job: Job<{ productId: string }>): Promise<void> {
    void job.data.productId;
    return Promise.resolve();
  }
}

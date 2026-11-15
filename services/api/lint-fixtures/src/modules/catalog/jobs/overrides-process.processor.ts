// lint-rule: R18 violates
import { Processor } from '@nestjs/bullmq';
import type { Job } from 'bullmq';
import { JobProcessor } from '@infra/queue/job-processor';

@Processor('catalog-sync')
export class OverridesProcessProcessor extends JobProcessor<{
  productId: string;
}> {
  protected handle(): Promise<void> {
    return Promise.resolve();
  }

  override process(job: Job<{ productId: string }>): Promise<void> {
    void job;
    return Promise.resolve();
  }
}

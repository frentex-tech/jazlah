import type { Type } from '@nestjs/common';
import type { TestingModuleBuilder } from '@nestjs/testing';

/**
 * Turns on the given workers (processors and schedulers registered with
 * `provideWorkers`) in an app whose QUEUE_WORKERS_ENABLED is false, as every e2e app's
 * is (scripts/e2e.mjs): each is provided as its own class again, so Nest creates it
 * with its dependencies and @nestjs/bullmq starts its worker. Everything else stays off.
 */
export function enableWorkers(
  builder: TestingModuleBuilder,
  workers: readonly Type[],
): TestingModuleBuilder {
  let enabled = builder;
  for (const worker of workers) {
    enabled = enabled.overrideProvider(worker).useClass(worker);
  }
  return enabled;
}

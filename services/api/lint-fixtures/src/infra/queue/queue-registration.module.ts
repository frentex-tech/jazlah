// lint-rule: R15 conforms
import { BullModule } from '@nestjs/bullmq';
import { type DynamicModule, Module } from '@nestjs/common';

/** Stand-in for the real QueueRegistrationModule: inside src/infra/queue, registerQueue is allowed. */
@Module({})
export class QueueRegistrationModule {
  static register(name: string): DynamicModule {
    const bull = BullModule.registerQueue({ name });
    return {
      module: QueueRegistrationModule,
      imports: [bull],
      exports: [bull],
    };
  }
}

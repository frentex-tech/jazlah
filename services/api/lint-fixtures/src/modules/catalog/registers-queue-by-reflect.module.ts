// lint-rule: R15 violates
import { BullModule } from '@nestjs/bullmq';

export const register: unknown = Reflect.get(BullModule, 'registerQueue');

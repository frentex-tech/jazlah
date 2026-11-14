// lint-rule: support
import { SetMetadata } from '@nestjs/common';

export const Audited = (): MethodDecorator => SetMetadata('audited', true);

// lint-rule: R8 violates
import { randomUUID } from 'node:crypto';

export const newOrderId = (): string => randomUUID();

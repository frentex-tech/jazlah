// lint-rule: R21 violates
import type { OrderShape } from './order-shape.type';

export function launder(text: string): OrderShape {
  return text as unknown as OrderShape;
}

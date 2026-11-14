// lint-rule: R21 violates
import type { OrderShape } from './order-shape.type';

export function readOrder(text: string): OrderShape {
  return JSON.parse(text) as OrderShape;
}

// lint-rule: R21 conforms
import type { OrderShape } from './order-shape.type';

const KINDS = ['order', 'refund'] as const;

function isOrderShape(value: unknown): value is OrderShape {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof Reflect.get(value, 'id') === 'string'
  );
}

export function readOrder(text: string): OrderShape | null {
  const data: unknown = JSON.parse(text);
  return isOrderShape(data) ? data : null;
}

export const kinds = KINDS;

import type { OrderType } from './order-type.type';

/** The kind of an order from the kinds of its lines: that kind when all agree, else `mixed`. */
export function orderTypeOf(kinds: readonly OrderType[]): OrderType {
  const [first, ...others] = kinds;
  if (first === undefined) {
    throw new RangeError('An order has at least one kind of line');
  }
  return others.every((kind) => kind === first) ? first : 'mixed';
}

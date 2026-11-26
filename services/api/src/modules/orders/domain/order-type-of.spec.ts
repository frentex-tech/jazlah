import { orderTypeOf } from './order-type-of';

describe('orderTypeOf', () => {
  it('is the kind of the lines when they agree', () => {
    expect(orderTypeOf(['ready_meat', 'ready_meat'])).toBe('ready_meat');
  });

  it('is mixed when the lines are of several kinds', () => {
    expect(orderTypeOf(['ready_meat', 'carcass'])).toBe('mixed');
  });

  it('refuses no kinds at all', () => {
    expect(() => orderTypeOf([])).toThrow(RangeError);
  });
});

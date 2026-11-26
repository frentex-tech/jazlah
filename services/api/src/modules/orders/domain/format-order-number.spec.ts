import { formatOrderNumber } from './format-order-number';

describe('formatOrderNumber', () => {
  it('is JZ, the day as YYMMDD and a 4-digit sequence', () => {
    expect(formatOrderNumber('2026-11-26', 1)).toBe('JZ-261126-0001');
    expect(formatOrderNumber('2026-11-26', 42)).toBe('JZ-261126-0042');
    expect(formatOrderNumber('2031-01-02', 9999)).toBe('JZ-310102-9999');
  });

  it('grows to 5 digits rather than repeating a number past 9999', () => {
    expect(formatOrderNumber('2026-11-26', 10_000)).toBe('JZ-261126-10000');
  });
});

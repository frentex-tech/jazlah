/**
 * The order number `JZ-YYMMDD-NNNN`: the Riyadh day it was placed and that day's
 * sequence from 1, at least 4 digits (the 10,000th order of a day gets 5).
 */
export function formatOrderNumber(day: string, sequence: number): string {
  const [year = '', month = '', date = ''] = day.split('-');
  const padded = String(sequence).padStart(4, '0');
  return `JZ-${year.slice(2)}${month}${date}-${padded}`;
}

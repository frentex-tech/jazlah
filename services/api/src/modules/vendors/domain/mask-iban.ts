/**
 * The masked form of an IBAN, the only form any response carries: its printed grouping
 * with every character hidden except the country and the last four
 * (`SA** **** **** **** **** 7519`).
 */
export function maskIban(last4: string): string {
  return `SA** **** **** **** **** ${last4}`;
}

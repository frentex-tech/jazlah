import { Iban } from './iban';
import { maskIban } from './mask-iban';

/** A published example of a Saudi IBAN. */
const VALID = 'SA0380000000608010167519';

describe('Iban', () => {
  it('accepts a valid Saudi IBAN and keeps its last four', () => {
    const iban = Iban.parse(VALID);

    expect(iban?.reveal()).toBe(VALID);
    expect(iban?.last4).toBe('7519');
  });

  it('accepts letters in the account part when the checksum holds', () => {
    // SA, each possible pair of check digits, bank 80, account 00000060801016751A: one
    // pair makes the checksum hold.
    const candidates = Array.from(
      { length: 99 },
      (_, n) => `SA${String(n).padStart(2, '0')}8000000060801016751A`,
    );
    const valid = candidates.filter((text) => Iban.parse(text) !== null);

    expect(valid).toHaveLength(1);
  });

  it.each([
    ['a wrong check digit', 'SA0480000000608010167519'],
    ['another country', 'AE070331234567890123456'],
    ['one character short', 'SA038000000060801016751'],
    ['one character long', 'SA03800000006080101675190'],
    ['lowercase', 'sa0380000000608010167519'],
    ['spaces', 'SA03 8000 0000 6080 1016 7519'],
    ['letters in the bank code', 'SA03AB000000608010167519'],
    ['empty', ''],
  ])('refuses %s', (_label, text) => {
    expect(Iban.parse(text)).toBeNull();
  });

  it('never shows the IBAN when turned into text', () => {
    const iban = Iban.parse(VALID);

    expect(String(iban)).toBe('Iban(…7519)');
    expect(JSON.stringify({ iban })).toBe('{"iban":"Iban(…7519)"}');
  });
});

describe('maskIban', () => {
  it('hides everything but the country and the last four', () => {
    expect(maskIban('7519')).toBe('SA** **** **** **** **** 7519');
  });
});

import { toLatinDigits } from './to-latin-digits';

describe('toLatinDigits', () => {
  it.each([
    ['Arabic-Indic digits', '٠١٢٣٤٥٦٧٨٩', '0123456789'],
    ['Extended Arabic-Indic digits', '۰۱۲۳۴۵۶۷۸۹', '0123456789'],
    ['the three forms mixed', '1٢۳4', '1234'],
    ['Latin digits', '482913', '482913'],
    ['text around digits', 'رمز ٤٨', 'رمز 48'],
    ['an empty string', '', ''],
  ])('converts %s', (_label, input, expected) => {
    expect(toLatinDigits(input)).toBe(expected);
  });

  it('leaves the digits of other scripts alone', () => {
    expect(toLatinDigits('०५१')).toBe('०५१');
  });
});

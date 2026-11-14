import { normalizeSaudiMobileNumber } from './normalize-saudi-mobile-number';

const E164 = '+966512345678';

describe('normalizeSaudiMobileNumber', () => {
  it.each([
    ['local with trunk zero', '0512345678'],
    ['local without trunk zero', '512345678'],
    ['country code without plus', '966512345678'],
    ['international prefix 00', '00966512345678'],
    ['E.164', '+966512345678'],
    ['spaces', '+966 51 234 5678'],
    ['dashes', '051-234-5678'],
    ['spaces and dashes mixed', ' 00966 - 51 234-5678 '],
    ['a tab between groups', '0512\t345678'],
  ])('normalises %s (%p)', (_label, input) => {
    expect(normalizeSaudiMobileNumber(input)).toBe(E164);
  });

  it.each([
    ['empty', ''],
    ['only separators', ' - '],
    ['a landline (Riyadh, 011)', '0112345678'],
    ['a landline in E.164', '+966112345678'],
    ['another country', '+971501234567'],
    ['too short', '051234567'],
    ['too long', '05123456789'],
    ['too long in E.164', '+9665123456789'],
    ['a trunk zero after the country code', '+9660512345678'],
    ['a plus not at the start', '966+512345678'],
    ['two pluses', '++966512345678'],
    ['parentheses', '(051) 234 5678'],
    ['dots', '051.234.5678'],
    ['letters', '05123456ab'],
    ['Arabic-Indic digits', '٠٥١٢٣٤٥٦٧٨'],
    ['a single 0 international prefix', '0966512345678'],
  ])('rejects %s (%p)', (_label, input) => {
    expect(normalizeSaudiMobileNumber(input)).toBeNull();
  });
});

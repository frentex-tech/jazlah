import { normalizeSaudiPhoneNumber } from './normalize-saudi-phone-number';

describe('normalizeSaudiPhoneNumber', () => {
  it.each([
    ['a mobile, local', '0512345678', '+966512345678'],
    ['a mobile in Arabic-Indic digits', '٠٥١٢٣٤٥٦٧٨', '+966512345678'],
    ['a Riyadh landline (011)', '0112345678', '+966112345678'],
    ['a Makkah landline (012) with spaces', '012 345 6789', '+966123456789'],
    ['a Dammam landline (013) with dashes', '013-345-6789', '+966133456789'],
    ['a 014 landline without trunk zero', '143456789', '+966143456789'],
    ['a 016 landline with country code', '966163456789', '+966163456789'],
    ['a 017 landline with 00', '00966173456789', '+966173456789'],
    ['a landline in E.164', '+966112345678', '+966112345678'],
    ['a landline in Arabic-Indic digits', '٠١١٢٣٤٥٦٧٨', '+966112345678'],
    [
      'a landline in Extended Arabic-Indic digits',
      '۰۱۱۲۳۴۵۶۷۸',
      '+966112345678',
    ],
    [
      'a landline wrapped in direction marks',
      '‪+966 11 234 5678‬',
      '+966112345678',
    ],
  ])('normalises %s', (_label, input, e164) => {
    expect(normalizeSaudiPhoneNumber(input)).toBe(e164);
  });

  it.each([
    ['empty', ''],
    ['area code 015 (not geographic)', '0152345678'],
    ['area code 018', '0182345678'],
    ['area code 019', '0192345678'],
    ['a toll-free 800 number', '8001234567'],
    ['a landline too short', '011234567'],
    ['a landline too long', '01123456789'],
    ['a trunk zero after the country code', '+9660112345678'],
    ['another country', '+97142345678'],
    ['parentheses', '(011) 234 5678'],
    ['letters', '01123456ab'],
  ])('refuses %s', (_label, input) => {
    expect(normalizeSaudiPhoneNumber(input)).toBeNull();
  });
});

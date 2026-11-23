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
    ['Arabic-Indic digits, local', '٠٥١٢٣٤٥٦٧٨'],
    ['Arabic-Indic digits, without trunk zero', '٥١٢٣٤٥٦٧٨'],
    ['Arabic-Indic digits, E.164 with spaces', '+٩٦٦ ٥١ ٢٣٤ ٥٦٧٨'],
    ['Arabic-Indic digits, international prefix 00', '٠٠٩٦٦٥١٢٣٤٥٦٧٨'],
    ['Extended Arabic-Indic digits, local', '۰۵۱۲۳۴۵۶۷۸'],
    [
      'Extended Arabic-Indic digits, country code with dashes',
      '۹۶۶-۵۱۲-۳۴۵-۶۷۸',
    ],
    ['Extended Arabic-Indic digits, E.164', '+۹۶۶۵۱۲۳۴۵۶۷۸'],
    ['Arabic-Indic mixed with Latin digits', '05١٢٣٤٥678'],
    ['Extended Arabic-Indic mixed with Latin digits', '+966 ۵۱ 234 ۵۶۷۸'],
    ['all three digit forms mixed', '٠5۱٢3۴٥6۷٨'],
    // Copied numbers (review of #232): invisible format characters around or inside.
    [
      'wrapped in LRE and PDF, as iOS copies a contact',
      '\u202A+966 51 234 5678\u202C',
    ],
    ['led by a left-to-right mark', '\u200E0512345678'],
    ['ended by a right-to-left mark', '0512345678\u200F'],
    ['wrapped in a left-to-right isolate', '\u2066+966512345678\u2069'],
    ['wrapped in a first-strong isolate', '\u2068+966512345678\u2069'],
    ['split by a zero-width space', '0512\u200B345678'],
    ['led by a byte order mark', '\uFEFF0512345678'],
    ['a no-break space between groups', '0512\u00A0345678'],
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
    ['a landline in Arabic-Indic digits', '٠١١٢٣٤٥٦٧٨'],
    ['too short in Arabic-Indic digits', '٠٥١٢٣٤٥٦٧'],
    ['another country in Extended Arabic-Indic digits', '+۹۷۱۵۰۱۲۳۴۵۶۷'],
    ['digits of another script (Devanagari)', '०५१२३४५६७८'],
    ['a single 0 international prefix', '0966512345678'],
  ])('rejects %s (%p)', (_label, input) => {
    expect(normalizeSaudiMobileNumber(input)).toBeNull();
  });
});

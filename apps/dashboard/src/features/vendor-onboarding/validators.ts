// Client-side checks that mirror the API's DTO rules (SubmitVendorApplicationDto, UpdateVendorProfileDto in
// services/api/openapi.json), so the user hears about a mistake before the round trip. The API checks again.
// Self-contained (no imports) so the unit test runs under plain Node.

/** As the API normalises before checking: invisible format characters and spaces removed, Arabic digits in Latin. */
export function compactDigits(s: string): string {
  return s
    .replace(/[\u200B-\u200F\u202A-\u202E\u2066-\u2069\uFEFF]/g, '')
    .replace(/[٠-٩۰-۹]/g, (d) => String((d.charCodeAt(0) & 0xf) % 10))
    .replace(/\s+/g, '');
}

/** Commercial registration: 10 digits, Latin or Arabic. */
export const isCrNumber = (s: string) => /^\d{10}$/.test(compactDigits(s));

/** VAT registration number: 15 digits starting and ending with 3. */
export const isVatNumber = (s: string) => /^3\d{13}3$/.test(compactDigits(s));

/** An IBAN in electronic form, as the API reads it: no spaces, Latin digits, capitals. */
export const ibanElectronic = (s: string) => compactDigits(s).toUpperCase();

/** A Saudi IBAN: SA, 2 check digits, 2-digit bank code, 18-character account, and a correct ISO 13616 mod-97 checksum. */
export function isSaudiIban(s: string): boolean {
  const iban = ibanElectronic(s);
  if (!/^SA\d{4}[A-Z0-9]{18}$/.test(iban)) return false;
  let remainder = 0;
  for (const ch of iban.slice(4) + iban.slice(0, 4)) {
    const digits = ch >= 'A' ? String(ch.charCodeAt(0) - 55) : ch;
    for (const d of digits) remainder = (remainder * 10 + Number(d)) % 97;
  }
  return remainder === 1;
}

/** "SA0380000000608010167519" → "SA03 8000 0000 6080 1016 7519", as the Figma field shows it. */
export const formatIban = (s: string) => ibanElectronic(s).slice(0, 24).replace(/(.{4})(?=.)/g, '$1 ');

/** Bank of a Saudi IBAN from its 2-digit bank code (SAMA), for display only. Unknown codes: null. */
const BANKS: Record<string, { ar: string; en: string }> = {
  '05': { ar: 'مصرف الإنماء', en: 'Alinma Bank' },
  '10': { ar: 'البنك الأهلي السعودي', en: 'Saudi National Bank' },
  '15': { ar: 'بنك البلاد', en: 'Bank Albilad' },
  '20': { ar: 'بنك الرياض', en: 'Riyad Bank' },
  '30': { ar: 'البنك العربي الوطني', en: 'Arab National Bank' },
  '45': { ar: 'البنك السعودي الأول', en: 'Saudi Awwal Bank' },
  '55': { ar: 'البنك السعودي الفرنسي', en: 'Banque Saudi Fransi' },
  '60': { ar: 'بنك الجزيرة', en: 'Bank AlJazira' },
  '65': { ar: 'البنك السعودي للاستثمار', en: 'Saudi Investment Bank' },
  '80': { ar: 'مصرف الراجحي', en: 'Al Rajhi Bank' },
};
export const bankOfIban = (s: string) => {
  const iban = ibanElectronic(s);
  return /^SA\d{4}/.test(iban) ? (BANKS[iban.slice(4, 6)] ?? null) : null;
};

/** Text length the way the API counts it (code points, after trimming); `min` 0 means optional. */
export function lengthOk(s: string, min: number, max: number): boolean {
  const n = [...s.replace(/[\u200B-\u200F\u202A-\u202E\u2066-\u2069\uFEFF]/g, '').trim()].length;
  return n >= min && n <= max;
}

/** Store contact number (isSaudiPhoneNumber): 9 national digits, a mobile 5XXXXXXXX or a landline 1[1-467]XXXXXXX. */
export const isSaudiContactPhone = (digits: string) => /^(5\d{8}|1[1-467]\d{7})$/.test(digits);

/** Contact email (isEmail, up to 254): a shape check; the stricter isEmail of the API answers VALIDATION_FAILED for the rest. */
export const isEmail = (s: string) => s.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s.trim());

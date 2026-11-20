/** Formats a date as in the frames: «12 أكتوبر 2026», Gregorian with Latin digits, Riyadh time. */
export const dayOf = (iso: string, locale: string) =>
  new Intl.DateTimeFormat(locale === 'en' ? 'en-GB' : 'ar-SA-u-ca-gregory-nu-latn', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Riyadh' }).format(new Date(iso));

/** Formats a date as in the frames: «12 أكتوبر 2026», Gregorian with Latin digits, Riyadh time. */
export const dayOf = (iso: string, locale: string) =>
  new Intl.DateTimeFormat(locale === 'en' ? 'en-GB' : 'ar-SA-u-ca-gregory-nu-latn', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Riyadh' }).format(new Date(iso));
/** The time of day as in the frames: «02:40 م» / «02:40 PM», Riyadh time. */
export const timeOf = (iso: string, locale: string) =>
  new Intl.DateTimeFormat(locale === 'en' ? 'en-US' : 'ar-SA-u-nu-latn', { hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'Asia/Riyadh' }).format(new Date(iso));
/** Today's date in Riyadh, `YYYY-MM-DD` (business days are Riyadh days, docs/architecture.md). */
export const riyadhToday = (now = new Date()) => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Riyadh' }).format(now);
/** `YYYY-MM-DD` plus n days (calendar arithmetic, no time zone involved). */
export const addDays = (date: string, n: number) => new Date(Date.parse(`${date}T00:00:00Z`) + n * 86_400_000).toISOString().slice(0, 10);

import type { SmsEncoding } from './sms-encoding.type';

/**
 * The standard segment sizes, in the encoding's units: a text that fits `single` is one
 * SMS; a longer one is split into segments of `multipart`, each losing 6 bytes to the
 * concatenation header (7 septets in GSM-7, 3 code units in UCS-2).
 */
export const SMS_SEGMENT_SIZES: Readonly<
  Record<SmsEncoding, Readonly<{ single: number; multipart: number }>>
> = {
  'GSM-7': { single: 160, multipart: 153 },
  'UCS-2': { single: 70, multipart: 67 },
};

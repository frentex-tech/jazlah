import type { SmsEncoding } from './sms-encoding.type';

/** What `measureSmsText` reports about a message text. */
export type SmsTextMeasure = Readonly<{
  encoding: SmsEncoding;
  /**
   * The length in the encoding's units: septets for GSM-7 (an extension character such
   * as `€` or `{` takes two), UTF-16 code units for UCS-2 (a character outside the
   * Basic Multilingual Plane, such as most emoji, takes two).
   */
  units: number;
  /** How many SMS segments carry the text; 0 for an empty text. */
  segments: number;
}>;

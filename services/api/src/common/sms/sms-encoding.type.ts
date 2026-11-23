/**
 * How an SMS is encoded: GSM-7 (7-bit, the GSM default alphabet of 3GPP TS 23.038) when
 * every character is in it, UCS-2 (UTF-16 code units) otherwise, Arabic included.
 */
export type SmsEncoding = 'GSM-7' | 'UCS-2';

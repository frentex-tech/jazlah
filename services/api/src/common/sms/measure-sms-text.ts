import {
  GSM_7_BASIC_CHARACTERS,
  GSM_7_EXTENSION_CHARACTERS,
} from './gsm-7-alphabet.constants';
import { SMS_SEGMENT_SIZES } from './sms-segment-sizes.constants';
import type { SmsEncoding } from './sms-encoding.type';
import type { SmsTextMeasure } from './sms-text-measure.type';

const GSM_7_BASIC = new Set(GSM_7_BASIC_CHARACTERS);
const GSM_7_EXTENSION = new Set(GSM_7_EXTENSION_CHARACTERS);

/**
 * The encoding a text is sent in and how many segments it takes, with the standard
 * segment sizes (SMS_SEGMENT_SIZES). GSM-7 when every character is in the GSM default
 * alphabet or its extension table, UCS-2 otherwise (one Arabic letter makes the whole
 * text UCS-2).
 *
 * Segments are counted as phones split them: a character is never divided between two
 * segments, so an extension character (two septets) or a surrogate pair (two code
 * units) that would straddle a boundary moves whole to the next segment.
 */
export function measureSmsText(text: string): SmsTextMeasure {
  // By code point: a character outside the BMP is one entry of length 2, its UCS-2 cost.
  const characters = Array.from(text);
  const isGsm7 = characters.every(
    (character) => GSM_7_BASIC.has(character) || GSM_7_EXTENSION.has(character),
  );
  const encoding: SmsEncoding = isGsm7 ? 'GSM-7' : 'UCS-2';
  const costs = characters.map((character) =>
    isGsm7 ? (GSM_7_EXTENSION.has(character) ? 2 : 1) : character.length,
  );
  const units = costs.reduce((sum, cost) => sum + cost, 0);
  return { encoding, units, segments: countSegments(costs, units, encoding) };
}

function countSegments(
  costs: readonly number[],
  units: number,
  encoding: SmsEncoding,
): number {
  const { single, multipart } = SMS_SEGMENT_SIZES[encoding];
  if (units === 0) {
    return 0;
  }
  if (units <= single) {
    return 1;
  }
  let segments = 1;
  let used = 0;
  for (const cost of costs) {
    if (used + cost > multipart) {
      segments += 1;
      used = 0;
    }
    used += cost;
  }
  return segments;
}

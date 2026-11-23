import {
  GSM_7_BASIC_CHARACTERS,
  GSM_7_EXTENSION_CHARACTERS,
} from './gsm-7-alphabet.constants';
import { measureSmsText } from './measure-sms-text';

describe('measureSmsText', () => {
  it('holds 127 basic characters (128 minus the escape) and 10 extension characters', () => {
    expect(GSM_7_BASIC_CHARACTERS).toHaveLength(127);
    expect(new Set(GSM_7_BASIC_CHARACTERS).size).toBe(127);
    expect(new Set(GSM_7_EXTENSION_CHARACTERS).size).toBe(10);
  });

  it('reports an Arabic OTP message as one UCS-2 segment', () => {
    expect(measureSmsText('رمز التحقق: 1234')).toEqual({
      encoding: 'UCS-2',
      units: 16,
      segments: 1,
    });
  });

  it('reports an English OTP message as one GSM-7 segment', () => {
    expect(measureSmsText('Verification Code: 1234')).toEqual({
      encoding: 'GSM-7',
      units: 23,
      segments: 1,
    });
  });

  it('makes the whole text UCS-2 when one character is outside the GSM alphabet', () => {
    expect(measureSmsText(`${'a'.repeat(100)}ر`)).toEqual({
      encoding: 'UCS-2',
      units: 101,
      segments: 2,
    });
  });

  it.each([
    ['GSM-7 exactly at one segment', 'a'.repeat(160), 'GSM-7', 160, 1],
    ['GSM-7 one character over one segment', 'a'.repeat(161), 'GSM-7', 161, 2],
    ['GSM-7 exactly at two segments', 'a'.repeat(306), 'GSM-7', 306, 2],
    ['GSM-7 one character over two segments', 'a'.repeat(307), 'GSM-7', 307, 3],
    ['UCS-2 exactly at one segment', 'ك'.repeat(70), 'UCS-2', 70, 1],
    ['UCS-2 one character over one segment', 'ك'.repeat(71), 'UCS-2', 71, 2],
    ['UCS-2 exactly at two segments', 'ك'.repeat(134), 'UCS-2', 134, 2],
    ['UCS-2 one character over two segments', 'ك'.repeat(135), 'UCS-2', 135, 3],
  ] as const)('%s', (_label, text, encoding, units, segments) => {
    expect(measureSmsText(text)).toEqual({ encoding, units, segments });
  });

  it('counts an extension character as two septets', () => {
    expect(measureSmsText(`${'a'.repeat(158)}€`)).toEqual({
      encoding: 'GSM-7',
      units: 160,
      segments: 1,
    });
    expect(measureSmsText(`${'a'.repeat(159)}€`)).toEqual({
      encoding: 'GSM-7',
      units: 161,
      segments: 2,
    });
  });

  it('never splits an extension character between segments', () => {
    // 152 septets, then € (2) would end at 154 > 153: it opens the second segment,
    // which then holds 2 + 151 septets, and the last septet opens a third.
    expect(measureSmsText(`${'a'.repeat(152)}€${'a'.repeat(152)}`)).toEqual({
      encoding: 'GSM-7',
      units: 306,
      segments: 3,
    });
  });

  it('counts a character outside the BMP as two UCS-2 units, never split', () => {
    expect(measureSmsText('😀'.repeat(35))).toEqual({
      encoding: 'UCS-2',
      units: 70,
      segments: 1,
    });
    // 33 emoji fill 66 of a segment's 67 units; the 34th opens the next segment, so 67
    // emoji (134 units, two segments by size alone) take three.
    expect(measureSmsText('😀'.repeat(67))).toEqual({
      encoding: 'UCS-2',
      units: 134,
      segments: 3,
    });
  });

  it('reports an empty text as zero segments', () => {
    expect(measureSmsText('')).toEqual({
      encoding: 'GSM-7',
      units: 0,
      segments: 0,
    });
  });
});

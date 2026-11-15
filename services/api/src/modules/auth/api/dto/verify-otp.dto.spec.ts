import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { VerifyOtpDto } from './verify-otp.dto';

const VALID = {
  phone: '0512345678',
  audience: 'customer',
  devicePlatform: 'ios',
};

async function checkCode(code: unknown) {
  const dto = plainToInstance(VerifyOtpDto, { ...VALID, code });
  const errors = await validate(dto);
  return { dto, codeErrors: errors.filter((e) => e.property === 'code') };
}

describe('VerifyOtpDto code', () => {
  it.each([
    ['Latin digits', '482913'],
    ['Arabic-Indic digits', '٤٨٢٩١٣'],
    ['Extended Arabic-Indic digits', '۴۸۲۹۱۳'],
    ['surrounding spaces', ' 482913 '],
    // Codes pasted in an Arabic interface carry the same invisible marks as phones.
    ['led by a left-to-right mark', '‎482913'],
    ['ended by a right-to-left mark', '482913‏'],
    ['wrapped in LRE and PDF', '‪482913‬'],
    ['wrapped in a left-to-right isolate', '⁦482913⁩'],
    ['led by a byte order mark', '﻿482913'],
    ['split by a zero-width space', '482​913'],
    ['Arabic digits with a right-to-left mark', '‏٤٨٢٩١٣'],
  ])('accepts %s (%p) as 482913', async (_label, input) => {
    const { dto, codeErrors } = await checkCode(input);

    expect(codeErrors).toEqual([]);
    expect(dto.code).toBe('482913');
  });

  it.each([
    ['too short', '482'],
    ['too long', '482913482'],
    ['a space inside', '482 913'],
    ['a letter', '48291a'],
    ['only format characters', '‎‏'],
    ['a number', 482913],
  ])('refuses %s', async (_label, input) => {
    const { codeErrors } = await checkCode(input);

    expect(codeErrors).toHaveLength(1);
    expect(codeErrors[0]?.constraints).toHaveProperty('matches');
  });
});

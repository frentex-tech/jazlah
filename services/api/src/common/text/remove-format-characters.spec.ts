import { removeFormatCharacters } from './remove-format-characters';

describe('removeFormatCharacters', () => {
  it.each([
    ['a left-to-right mark', '‎482913'],
    ['a right-to-left mark', '482913‏'],
    ['LRE and PDF', '‪482913‬'],
    ['RLO and PDF', '‮482913‬'],
    ['a left-to-right isolate', '⁦482913⁩'],
    ['a first-strong isolate', '⁨482913⁩'],
    ['a zero-width space inside', '482​913'],
    ['a byte order mark', '﻿482913'],
  ])('removes %s', (_label, input) => {
    expect(removeFormatCharacters(input)).toBe('482913');
  });

  it('leaves spaces, digits of every form and letters alone', () => {
    expect(removeFormatCharacters(' رمز ٤٨ 05 x ')).toBe(' رمز ٤٨ 05 x ');
  });

  it('returns an empty string for an empty string', () => {
    expect(removeFormatCharacters('')).toBe('');
  });
});

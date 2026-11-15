import { maskPhoneNumber } from './mask-phone-number';

describe('maskPhoneNumber', () => {
  it.each([
    '+966512345678',
    '0512345678',
    '966 51 234 5678',
    '00966-512345678',
  ])(
    'keeps only the country code and last two digits of a Saudi mobile number (%p)',
    (input) => {
      expect(maskPhoneNumber(input)).toBe('+966*******78');
    },
  );

  it('masks every digit but the last two of any other number', () => {
    expect(maskPhoneNumber('+971 50 123 4567')).toBe('**********67');
  });

  it('masks a value with fewer than four digits entirely', () => {
    expect(maskPhoneNumber('+123')).toBe('***');
    expect(maskPhoneNumber('')).toBe('');
  });

  it('drops letters and punctuation, so nothing but masked digits remains', () => {
    expect(maskPhoneNumber('call 0112 345 678 now')).toBe('********78');
  });
});

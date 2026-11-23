import { parseReviewAccounts } from './parse-review-accounts';

describe('parseReviewAccounts', () => {
  it('is empty for an empty value', () => {
    expect(parseReviewAccounts('')).toEqual([]);
    expect(parseReviewAccounts(' , ')).toEqual([]);
  });

  it('reads phone:code pairs and normalises the phones', () => {
    expect(
      parseReviewAccounts('0512345678:123456, +966 51 111 2222:0000'),
    ).toEqual([
      { phone: '+966512345678', code: '123456' },
      { phone: '+966511112222', code: '0000' },
    ]);
  });

  it.each([
    ['an entry without a code', '0512345678'],
    ['a number that is not a Saudi mobile', '0112345678:123456'],
    ['a code with letters', '0512345678:12a456'],
    ['a code that is too short', '0512345678:123'],
    ['a phone listed twice', '0512345678:123456,+966512345678:654321'],
  ])('refuses %s', (_label, value) => {
    expect(parseReviewAccounts(value)).toBeNull();
  });
});

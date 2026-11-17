import { parseReviewAccounts } from '@config/parse-review-accounts';
import { formatReviewAccountsLine } from './format-review-accounts-line';
import { listDevelopmentSignIns } from './list-development-sign-ins';

describe('formatReviewAccountsLine', () => {
  it.each([4, 6, 8])(
    'prints a line AUTH_REVIEW_ACCOUNTS accepts, with %i-digit codes',
    (otpLength) => {
      const signIns = listDevelopmentSignIns(otpLength);
      const line = formatReviewAccountsLine(signIns);
      const [name, value] = line.split('=');
      expect(name).toBe('AUTH_REVIEW_ACCOUNTS');
      expect(parseReviewAccounts(value)).toEqual(
        signIns.map(({ phone, code }) => ({ phone, code })),
      );
      for (const { code } of signIns) {
        expect(code).toMatch(new RegExp(`^\\d{${otpLength}}$`));
      }
    },
  );

  it('lists one account per audience, in the fake +9665000000NN block', () => {
    const signIns = listDevelopmentSignIns(6);
    expect(new Set(signIns.map((signIn) => signIn.audience))).toEqual(
      new Set(['customer', 'vendor', 'kitchen', 'admin']),
    );
    for (const { phone } of signIns) {
      expect(phone).toMatch(/^\+9665000000\d{2}$/);
    }
  });
});

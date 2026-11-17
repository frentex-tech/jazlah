import { escapeLikePattern } from './escape-like-pattern';

describe('escapeLikePattern', () => {
  it.each([
    ['plain text unchanged', 'ملحمة Riyadh', 'ملحمة Riyadh'],
    ['empty unchanged', '', ''],
    ['a percent sign', '50%', '50\\%'],
    ['an underscore', 'a_b', 'a\\_b'],
    ['a backslash', 'a\\b', 'a\\\\b'],
    ['all three, repeated', '%_\\%', '\\%\\_\\\\\\%'],
  ])('escapes %s', (_label, input, escaped) => {
    expect(escapeLikePattern(input)).toBe(escaped);
  });
});

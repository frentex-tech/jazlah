import { escapeLikePattern } from './escape-like-pattern';

describe('escapeLikePattern', () => {
  it('leaves text without wildcards unchanged', () => {
    expect(escapeLikePattern('نعيمي lamb')).toBe('نعيمي lamb');
    expect(escapeLikePattern('')).toBe('');
  });

  it('prefixes each %, _ and backslash with a backslash', () => {
    expect(escapeLikePattern('50%_off')).toBe('50\\%\\_off');
    expect(escapeLikePattern('a\\b')).toBe('a\\\\b');
    expect(escapeLikePattern('%%')).toBe('\\%\\%');
  });
});

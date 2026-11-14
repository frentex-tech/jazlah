import { buildOtpMessage } from './build-otp-message';

describe('buildOtpMessage', () => {
  it('writes the Arabic message', () => {
    expect(buildOtpMessage('482913', 'ar')).toBe('رمز التحقق في جزلة: 482913');
  });

  it('writes the English message', () => {
    expect(buildOtpMessage('482913', 'en')).toBe(
      'Your JAZLA verification code: 482913',
    );
  });
});

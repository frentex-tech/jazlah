import { buildOtpMessage } from './build-otp-message';

describe('buildOtpMessage', () => {
  it('writes the Arabic message', () => {
    expect(buildOtpMessage('482913', 'ar')).toBe('رمزك في جزلة: 482913');
  });

  it('fits one SMS segment in Arabic (70 characters)', () => {
    expect(buildOtpMessage('482913', 'ar').length).toBeLessThanOrEqual(70);
  });

  it('writes the English message', () => {
    expect(buildOtpMessage('482913', 'en')).toBe(
      'Your JAZLA verification code: 482913',
    );
  });
});

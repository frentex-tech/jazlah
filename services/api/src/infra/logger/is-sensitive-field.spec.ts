import { isSensitiveField } from './is-sensitive-field';

describe('isSensitiveField', () => {
  it.each([
    'password',
    'Password',
    'PASSWORD',
    'newPassword',
    'new_password',
    'token',
    'accessToken',
    'refresh_token',
    'otp',
    'otpCode',
    'OTP',
    'secret',
    'clientSecret',
    'apiKey',
    'api_key',
    'x-api-key',
    'apikey',
    'authorization',
    'Authorization',
    'cookie',
    'privateKey',
  ])('treats %s as sensitive', (name) => {
    expect(isSensitiveField(name)).toBe(true);
  });

  it.each(['footprint', 'phone', 'orderId', 'keyboard', 'action', 'spinner'])(
    'leaves %s alone',
    (name) => {
      expect(isSensitiveField(name)).toBe(false);
    },
  );
});

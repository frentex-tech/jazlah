/**
 * Words that make a field name secret-like on their own (`isSensitiveField`). Matched
 * as whole words of the name, case-insensitively: `otp` matches `otpCode` and `OTP`.
 */
export const SENSITIVE_FIELD_WORDS: readonly string[] = [
  'password',
  'passwd',
  'passcode',
  'pin',
  'token',
  'secret',
  'otp',
  'authorization',
  'cookie',
  'credential',
  'credentials',
  'cvv',
  'cvc',
  'iban',
  'apikey',
  'privatekey',
];

/** Two adjacent words that together make a field name secret-like (`api_key`, `privateKey`). */
export const SENSITIVE_FIELD_PAIRS: readonly string[] = [
  'apikey',
  'privatekey',
  'accesskey',
  'secretkey',
  'cardnumber',
];

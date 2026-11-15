import {
  SENSITIVE_FIELD_PAIRS,
  SENSITIVE_FIELD_WORDS,
} from './sensitive-fields.constants';

/**
 * Whether a field name is secret-like, case-insensitively and whatever its style:
 * `password`, `newPassword`, `PASSWORD`, `access_token`, `refreshToken`, `otpCode`,
 * `apiKey`, `x-api-key`, `clientSecret`. The name is split into words (camelCase,
 * snake_case, kebab-case); it is sensitive when a word, or two adjacent words joined
 * (`api` + `key`), is in the lists. Splitting avoids false matches inside other words
 * (`footprint` contains "otp" but is not sensitive).
 */
export function isSensitiveField(name: string): boolean {
  const words = name
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((word) => word !== '');
  return words.some(
    (word, index) =>
      SENSITIVE_FIELD_WORDS.includes(word) ||
      (index > 0 &&
        SENSITIVE_FIELD_PAIRS.includes(`${words[index - 1]}${word}`)),
  );
}

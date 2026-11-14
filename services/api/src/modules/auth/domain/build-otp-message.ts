import type { Language } from '@common/i18n/language.type';
import type { LocalizedText } from '@common/i18n/localized-text.type';

/** The text before the code, per language. The wording is the backend owner's (2026-11-14). */
const OTP_MESSAGE_PREFIX: LocalizedText = {
  ar: 'رمز التحقق في جزلة: ',
  en: 'Your JAZLA verification code: ',
};

/** The SMS that carries a verification code, in the user's language. */
export function buildOtpMessage(code: string, language: Language): string {
  return `${OTP_MESSAGE_PREFIX[language]}${code}`;
}

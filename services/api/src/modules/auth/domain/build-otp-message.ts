import type { Language } from '@common/i18n/language.type';
import type { LocalizedText } from '@common/i18n/localized-text.type';

/**
 * The text before the code, per language. Arabic is in the product's Saudi voice
 * (error-messages.constants.ts); the whole message must fit one SMS segment (70
 * characters when it holds Arabic).
 */
const OTP_MESSAGE_PREFIX: LocalizedText = {
  ar: 'رمزك في جزلة: ',
  en: 'Your JAZLA verification code: ',
};

/** The SMS that carries a verification code, in the user's language. */
export function buildOtpMessage(code: string, language: Language): string {
  return `${OTP_MESSAGE_PREFIX[language]}${code}`;
}

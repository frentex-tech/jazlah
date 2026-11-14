import type { Audience } from '@common/auth/audience.type';
import type { Language } from '@common/i18n/language.type';

export type RequestOtpInput = Readonly<{
  /** E.164. */
  phone: string;
  audience: Audience;
  /** The language of the message. */
  language: Language;
}>;

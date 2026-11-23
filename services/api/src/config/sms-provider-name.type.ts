import type { SMS_PROVIDERS } from './sms-providers.constants';

/** A name SMS_PROVIDERS may list. */
export type SmsProviderName = (typeof SMS_PROVIDERS)[number];

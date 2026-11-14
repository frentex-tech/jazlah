import type { SmsProviderName } from './sms-provider-name.type';

/**
 * The environment variables each sms provider needs. Startup fails, naming each missing
 * variable, when SMS_PROVIDERS lists a provider without them (`env.schema.ts`). The log
 * provider needs none.
 */
export const SMS_PROVIDER_VARIABLES: Readonly<
  Record<SmsProviderName, readonly string[]>
> = {
  log: [],
};

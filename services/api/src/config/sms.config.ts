import { registerAs } from '@nestjs/config';
import { loadEnv } from './load-env';

/**
 * The `sms` namespace: the providers of the sms integration (`src/integrations/sms/`),
 * in the order they are tried, and how long each provider call may take. Inject with
 * `@Inject(smsConfig.KEY) config: SmsConfig`.
 */
export const smsConfig = registerAs('sms', () => {
  const env = loadEnv();
  return {
    providers: env.SMS_PROVIDERS,
    providerTimeoutMs: env.SMS_PROVIDER_TIMEOUT_MS,
  };
});

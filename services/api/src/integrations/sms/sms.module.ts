import { Module } from '@nestjs/common';
import { smsConfig } from '@config/sms.config';
import type { SmsConfig } from '@config/sms-config.type';
import type { SmsProviderName } from '@config/sms-provider-name.type';
import { LogSmsProvider } from './providers/log.provider';
import { SMS_PORTS, type SmsPort } from './sms.port';
import { SmsService } from './sms.service';

/**
 * The sms integration. SMS_PROVIDERS lists the providers in the order the service tries
 * them, with fallback on retryable failures (`.claude/rules/integrations.md`, "Mail,
 * SMS, push"). The environment schema has already refused an unknown provider, one
 * listed twice, one missing its variables (SMS_PROVIDER_VARIABLES) and the log provider
 * in production; the service refuses an empty list. A new vendor is its provider file
 * and test, one entry in PROVIDERS, and its name and variables in `src/config/`.
 *
 * This is the only file that names provider classes. Tests replace the list with
 * fakes from `@integrations/sms/testing`:
 * `.overrideProvider(SMS_PORTS).useValue([new FakeSmsProvider('first'), …])`.
 */
@Module({
  providers: [
    {
      provide: SMS_PORTS,
      inject: [smsConfig.KEY],
      useFactory: (config: SmsConfig): readonly SmsPort[] =>
        config.providers.map((name) => new SmsModule.PROVIDERS[name](config)),
    },
    SmsService,
  ],
  exports: [SmsService],
})
export class SmsModule {
  /** The provider class of each SMS_PROVIDERS name. */
  static readonly PROVIDERS: Readonly<
    Record<SmsProviderName, new (config: SmsConfig) => SmsPort>
  > = {
    log: LogSmsProvider,
  };
}

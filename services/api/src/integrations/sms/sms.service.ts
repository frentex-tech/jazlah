import { Inject, Injectable, Logger } from '@nestjs/common';
import { withTimeout } from '@common/async/with-timeout';
import { TimeoutError } from '@common/async/timeout.error';
import { maskPhoneNumber } from '@common/phone/mask-phone-number';
import { normalizeSaudiMobileNumber } from '@common/phone/normalize-saudi-mobile-number';
import { measureSmsText } from '@common/sms/measure-sms-text';
import { smsConfig } from '@config/sms.config';
import type { SmsConfig } from '@config/sms-config.type';
import { SMS_PORTS, type SmsPort } from './sms.port';
import { SmsConfigurationError, SmsError, SmsNotSentError } from './sms.errors';
import type {
  SendSmsRequest,
  SmsMessage,
  SmsProviderFailure,
  SmsSent,
} from './sms.types';

/**
 * What the rest of the API calls to send an SMS. The reference for ordered provider
 * fallback (`.claude/rules/integrations.md`, "Mail, SMS, push"): mail and push copy it.
 *
 * - The number is normalised to E.164 first; one that is not a Saudi mobile number,
 *   or an empty text, is refused (SmsError) before any provider is called.
 * - Providers are tried in SMS_PROVIDERS order, each call bounded by
 *   SMS_PROVIDER_TIMEOUT_MS. A retryable failure (SmsError.retryable: unavailable,
 *   timeout, throttled, or an error the provider does not recognise) moves to the next
 *   provider; a non-retryable one stops. When no provider sent it, SmsNotSentError
 *   carries every attempt.
 * - The log names the provider that sent each message and every failure, with the
 *   number masked and never the text.
 *
 * It knows nothing about OTPs: codes, expiry and verification belong to their module.
 */
@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);

  constructor(
    @Inject(SMS_PORTS) private readonly providers: readonly SmsPort[],
    @Inject(smsConfig.KEY) private readonly config: SmsConfig,
  ) {
    if (providers.length === 0) {
      throw new SmsConfigurationError(
        'SMS_PROVIDERS names no provider: list at least one (see .env.example)',
      );
    }
  }

  /** Sends one text to one number, trying each provider in order until one accepts it. */
  async send(request: SendSmsRequest): Promise<SmsSent> {
    const to = normalizeSaudiMobileNumber(request.to);
    if (to === null) {
      throw new SmsError('invalid-number');
    }
    if (request.text === '') {
      throw new SmsError('invalid-message');
    }
    const message: SmsMessage = { to, text: request.text };
    const context = {
      to: maskPhoneNumber(to),
      ...measureSmsText(request.text),
    };
    const failures: SmsProviderFailure[] = [];
    for (const provider of this.providers) {
      try {
        const sent = await this.attempt(provider, message);
        this.logger.log(
          { ...context, provider: sent.provider, messageId: sent.messageId },
          'SMS sent',
        );
        return sent;
      } catch (error) {
        const failure = toSmsError(error);
        failures.push({ provider: provider.name, error: failure });
        this.logger.warn(
          {
            ...context,
            provider: provider.name,
            reason: failure.reason,
            retryable: failure.retryable,
            err: failure,
          },
          'SMS provider failed',
        );
        if (!failure.retryable) {
          break;
        }
      }
    }
    throw new SmsNotSentError(failures);
  }

  /** One provider call, bounded; on timeout its signal aborts so its request stops. */
  private async attempt(
    provider: SmsPort,
    message: SmsMessage,
  ): Promise<SmsSent> {
    const controller = new AbortController();
    try {
      return await withTimeout(
        provider.send(message, controller.signal),
        this.config.providerTimeoutMs,
      );
    } finally {
      controller.abort();
    }
  }
}

/** A provider's failure as an SmsError: a timeout, or `unknown` for anything unmapped. */
function toSmsError(error: unknown): SmsError {
  if (error instanceof SmsError) {
    return error;
  }
  if (error instanceof TimeoutError) {
    return new SmsError('timeout', { cause: error });
  }
  return new SmsError('unknown', { cause: error });
}

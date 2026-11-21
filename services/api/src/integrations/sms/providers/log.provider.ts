import { randomUUID } from 'node:crypto';
import { Logger } from '@nestjs/common';
import type { SmsPort } from '../sms.port';
import type { SmsMessage, SmsSent } from '../sms.types';

/**
 * Sends nothing: writes the whole message, number and text, to the log, so a developer
 * can read an OTP code locally or on staging. The only provider that logs a text. The
 * environment schema refuses it when DEPLOYMENT_ENV is production (SMS_PROVIDERS),
 * allows it on staging when listed; the default outside NODE_ENV=production. It never
 * fails.
 */
export class LogSmsProvider implements SmsPort {
  readonly name = 'log';
  private readonly logger = new Logger(LogSmsProvider.name);

  send(message: SmsMessage): Promise<SmsSent> {
    const messageId = `log-${randomUUID()}`;
    this.logger.log(
      { messageId, to: message.to, text: message.text },
      'SMS written to the log instead of sent (development and staging only)',
    );
    return Promise.resolve({ provider: this.name, messageId });
  }
}

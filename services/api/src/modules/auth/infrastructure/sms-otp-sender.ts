import { Injectable } from '@nestjs/common';
import { SmsService } from '@integrations/sms';
import type { OtpSender } from '../domain/ports/otp-sender.port';

/** Sends verification messages through the sms integration (ordered provider fallback). */
@Injectable()
export class SmsOtpSender implements OtpSender {
  constructor(private readonly sms: SmsService) {}

  async send(phone: string, text: string): Promise<void> {
    await this.sms.send({ to: phone, text });
  }
}

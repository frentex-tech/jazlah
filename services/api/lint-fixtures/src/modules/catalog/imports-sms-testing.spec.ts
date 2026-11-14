// lint-rule: R6 R22 conforms
import { SmsService } from '@integrations/sms';
import { FakeSmsProvider } from '@integrations/sms/testing';

export const used = [SmsService, new FakeSmsProvider()];

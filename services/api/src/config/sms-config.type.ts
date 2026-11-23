import type { ConfigType } from '@nestjs/config';
import type { smsConfig } from './sms.config';

export type SmsConfig = ConfigType<typeof smsConfig>;

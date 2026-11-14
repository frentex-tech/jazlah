// lint-rule: R4 conforms
import { APP_NAME } from '@common/app-name.constants';
import { DEFAULT_PORT } from '@config/values.constants';
import { now } from '@infra/clock/clock';
import { FakeSmsProvider } from './providers/fake.provider';

export class SmsService {
  private readonly provider = new FakeSmsProvider();

  send(): string {
    return `${APP_NAME}:${DEFAULT_PORT}:${now().getTime()}:${this.provider.send()}`;
  }
}

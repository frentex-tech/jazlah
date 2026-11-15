// lint-rule: R6 R7 conforms
import { DEFAULT_PORT } from '@config/values.constants';
import { now } from '@infra/clock/clock';
import { SMS_PORT } from '@integrations/sms';
import { CATALOG_NAME } from '@modules/catalog';

export class AppModule {
  readonly parts = [DEFAULT_PORT, now(), SMS_PORT, CATALOG_NAME];
}

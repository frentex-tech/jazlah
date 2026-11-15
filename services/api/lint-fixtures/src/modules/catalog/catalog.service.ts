// lint-rule: R5 R6 R7 conforms
import { APP_NAME } from '@common/app-name.constants';
import { DEFAULT_PORT } from '@config/values.constants';
import { now } from '@infra/clock/clock';
import { SMS_PORT } from '@integrations/sms';
import { PlaceOrderUseCase } from '@modules/orders';
import { CATALOG_NAME } from './catalog.constants';

export class CatalogService {
  readonly parts = [APP_NAME, DEFAULT_PORT, now(), SMS_PORT, CATALOG_NAME];
  readonly placeOrder = new PlaceOrderUseCase();
}

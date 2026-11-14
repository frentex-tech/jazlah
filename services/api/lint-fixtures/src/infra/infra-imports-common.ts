// lint-rule: R0 R3 conforms
import { APP_NAME } from '@common/app-name.constants';
import { DEFAULT_PORT } from '@config/values.constants';
import { now } from './clock/clock';

export const banner = `${APP_NAME}:${DEFAULT_PORT}:${now().getTime()}`;

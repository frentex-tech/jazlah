import type { ConfigType } from '@nestjs/config';
import type { vendorsConfig } from './vendors.config';

export type VendorsConfig = ConfigType<typeof vendorsConfig>;

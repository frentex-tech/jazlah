import type { ConfigType } from '@nestjs/config';
import type { httpConfig } from './http.config';

export type HttpConfig = ConfigType<typeof httpConfig>;

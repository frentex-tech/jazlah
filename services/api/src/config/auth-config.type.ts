import type { ConfigType } from '@nestjs/config';
import type { authConfig } from './auth.config';

export type AuthConfig = ConfigType<typeof authConfig>;

import type { ConfigType } from '@nestjs/config';
import type { mediaConfig } from './media.config';

export type MediaConfig = ConfigType<typeof mediaConfig>;

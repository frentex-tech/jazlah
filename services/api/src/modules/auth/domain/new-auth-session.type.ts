import type { Audience } from '@common/auth/audience.type';
import type { DevicePlatform } from './device-platform.type';

/** What the repository needs to store a new session. */
export type NewAuthSession = Readonly<{
  userId: string;
  audience: Audience;
  organisationId: string | null;
  deviceName: string | null;
  devicePlatform: DevicePlatform;
  lastUsedAt: Date;
}>;

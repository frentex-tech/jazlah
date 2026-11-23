import type { Audience } from '@common/auth/audience.type';
import type { DevicePlatform } from '../domain/device-platform.type';

export type VerifyOtpInput = Readonly<{
  /** E.164. */
  phone: string;
  audience: Audience;
  /** Latin digits. */
  code: string;
  devicePlatform: DevicePlatform;
  /** Null when the client sent none. */
  deviceName: string | null;
}>;

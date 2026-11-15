import type { DEVICE_PLATFORMS } from './device-platforms.constants';

export type DevicePlatform = (typeof DEVICE_PLATFORMS)[number];

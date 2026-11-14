import type { Audience } from '@common/auth/audience.type';

/** The audiences that are granted, never self-registered. */
export type StaffAudience = Exclude<Audience, 'customer'>;

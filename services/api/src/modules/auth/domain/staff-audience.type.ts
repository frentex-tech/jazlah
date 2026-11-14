import type { Audience } from '@common/auth/audience.type';

/** The audiences whose access is granted, never self-registered. */
export type StaffAudience = Exclude<Audience, 'customer'>;

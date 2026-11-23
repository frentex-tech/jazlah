import type { Audience } from './audience.type';

/** The audiences whose access is granted (user_access), never self-registered. */
export type StaffAudience = Exclude<Audience, 'customer'>;

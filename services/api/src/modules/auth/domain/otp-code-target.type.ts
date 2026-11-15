import type { Audience } from '@common/auth/audience.type';

/** What a code is issued for: its hash is bound to both. */
export type OtpCodeTarget = Readonly<{ phone: string; audience: Audience }>;

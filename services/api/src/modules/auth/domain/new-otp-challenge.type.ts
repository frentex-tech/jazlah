import type { Audience } from '@common/auth/audience.type';

/** What the repository needs to store a new challenge. */
export type NewOtpChallenge = Readonly<{
  phone: string;
  audience: Audience;
  codeHash: string;
  expiresAt: Date;
  createdAt: Date;
}>;

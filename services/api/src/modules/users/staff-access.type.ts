import type { StaffAudience } from '@common/auth/staff-audience.type';

/** An active staff access of a user. */
export type StaffAccess = Readonly<{
  userId: string;
  audience: StaffAudience;
  /** The vendor or kitchen; null for admin. */
  organisationId: string | null;
}>;

import type { AuthenticatedUser } from '@common/auth/authenticated-user.type';

/** The signed-in user with their phone (E.164; the API layer masks it). */
export type CurrentUserProfile = AuthenticatedUser &
  Readonly<{ phone: string }>;

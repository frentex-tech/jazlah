import type { Audience } from './audience.type';

/**
 * Who is making an authenticated request: what the access token says. The
 * authentication guard attaches it to the request and `@CurrentUser()` reads it.
 */
export type AuthenticatedUser = Readonly<{
  userId: string;
  /** The session the token belongs to. */
  sessionId: string;
  /** The one audience the user signed in as. */
  audience: Audience;
  /** The vendor or kitchen the user acts for; null for customers and admins. */
  organisationId: string | null;
}>;

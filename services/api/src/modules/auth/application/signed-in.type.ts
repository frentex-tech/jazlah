import type { AuthTokens } from '../domain/auth-tokens.type';
import type { CurrentUserProfile } from './current-user-profile.type';

/** What a successful verification returns: the tokens, and who signed in. */
export type SignedIn = Readonly<{
  tokens: AuthTokens;
  principal: CurrentUserProfile;
  /** Whether a customer's profile is complete; null for a staff sign-in. */
  profileComplete: boolean | null;
}>;

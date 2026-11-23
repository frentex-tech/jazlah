import type { AuthenticatedUser } from './authenticated-user.type';

/**
 * The vendor a signed-in vendor user acts for: the token's organisation. A vendor token
 * always carries one; the organisation status guard has already refused one without.
 */
export function organisationOf(user: AuthenticatedUser): string {
  if (user.organisationId === null) {
    throw new Error(
      'A vendor token without an organisation reached a vendor route',
    );
  }
  return user.organisationId;
}

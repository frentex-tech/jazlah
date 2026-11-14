/**
 * The audiences a user signs in as, which are also the route prefixes that need a
 * sign-in: `/v1/customer/...`, `/v1/vendor/...`, `/v1/kitchen/...`, `/v1/admin/...`.
 * A sign-in, a session and an access token are for exactly one of them.
 */
export const AUDIENCES = ['customer', 'vendor', 'kitchen', 'admin'] as const;

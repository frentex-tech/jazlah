/**
 * Why a session ended early. `logout`: the client signed out of it. `logout_all`: the
 * user signed out of every session of the audience. `reuse_detected`: a refresh token
 * that had already been exchanged came back. `access_lost`: at refresh the user was
 * disabled or gone, or the staff access was no longer active.
 */
export type SessionRevocationReason =
  'logout' | 'logout_all' | 'reuse_detected' | 'access_lost';

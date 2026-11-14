/**
 * `usable`: a code may be tried. `consumed`: a correct code was already accepted.
 * `expired`: its time ran out. `exhausted`: its attempts are used up.
 */
export type OtpChallengeState = 'usable' | 'consumed' | 'expired' | 'exhausted';

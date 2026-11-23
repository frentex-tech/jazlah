/**
 * `usable`: it may be exchanged. `used`: it already was, so presenting it again is
 * reuse. `expired`: never exchanged, and its time ran out.
 */
export type RefreshTokenState = 'usable' | 'used' | 'expired';

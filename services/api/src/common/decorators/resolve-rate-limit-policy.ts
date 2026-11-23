import type { ConfiguredRateLimits } from '@config/configured-rate-limits.type';
import type { RateLimitDeclaration } from './rate-limit-declaration.type';
import type { RateLimitPolicy } from './rate-limit-policy.type';
import { toRateLimitPolicy } from './to-rate-limit-policy';

/**
 * The policy of a declaration: itself when its numbers were written in the decorator,
 * otherwise the numbers its `from` picks out of `limits`, validated like any other
 * (toRateLimitPolicy throws InvalidRateLimitOptionsError). The one place a configured
 * limit becomes numbers: the guard, the startup check and RateLimiter all call it.
 */
export function resolveRateLimitPolicy(
  declaration: RateLimitDeclaration,
  limits: ConfiguredRateLimits,
): RateLimitPolicy {
  if (!('from' in declaration)) {
    return declaration;
  }
  return toRateLimitPolicy({
    name: declaration.name,
    failClosed: declaration.failClosed,
    ...declaration.from(limits),
  });
}

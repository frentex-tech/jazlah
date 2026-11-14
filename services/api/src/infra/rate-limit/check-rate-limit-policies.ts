import type { RateLimitPolicy } from '@common/decorators/rate-limit-policy.type';
import { InvalidRateLimitSetupError } from './invalid-rate-limit-setup.error';
import type { RateLimitedEndpoint } from './rate-limited-endpoint.type';

/**
 * Throws InvalidRateLimitSetupError when the declared rate limits contradict each other:
 *
 * - A method `@RateLimit` under a class-level `@SkipRateLimit`. The skip would win and
 *   the limit would silently not apply.
 * - Two endpoints declaring one counter name with different settings. They share the
 *   counter, so one of them would be limited by the other's settings. Both are named.
 */
export function checkRateLimitPolicies(
  endpoints: readonly RateLimitedEndpoint[],
): void {
  const byName = new Map<
    string,
    { endpoint: string; policy: RateLimitPolicy }
  >();
  for (const {
    endpoint,
    methodPolicy,
    classPolicy,
    classSkipped,
  } of endpoints) {
    if (classSkipped && methodPolicy !== undefined) {
      throw new InvalidRateLimitSetupError(
        `${endpoint} has @RateLimit("${methodPolicy.name}") but its controller has @SkipRateLimit, which would turn it off. Remove one of them.`,
      );
    }
    const policy = methodPolicy ?? classPolicy;
    if (policy === undefined) {
      continue;
    }
    const first = byName.get(policy.name);
    if (first === undefined) {
      byName.set(policy.name, { endpoint, policy });
    } else if (!samePolicy(first.policy, policy)) {
      throw new InvalidRateLimitSetupError(
        `@RateLimit("${policy.name}") is declared with different settings on ${first.endpoint} (${describe(first.policy)}) and ${endpoint} (${describe(policy)}). Endpoints share a counter only with the same settings: use one setting, or another name.`,
      );
    }
  }
}

function samePolicy(a: RateLimitPolicy, b: RateLimitPolicy): boolean {
  return (
    a.limit === b.limit &&
    a.windowMs === b.windowMs &&
    a.blockMs === b.blockMs &&
    a.failClosed === b.failClosed
  );
}

function describe(policy: RateLimitPolicy): string {
  return `limit ${policy.limit}, windowMs ${policy.windowMs}, blockMs ${policy.blockMs}, failClosed ${policy.failClosed}`;
}

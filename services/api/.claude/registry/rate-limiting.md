# Registry: Rate limiting

One line per building block: name, path, purpose; the detail is in that file's doc comment. Listed by the index, `.claude/REGISTRY.md`. Paths are relative to `services/api/`.

- **Rate limit policy** — `src/common/decorators/to-rate-limit-policy.ts` — validates `@RateLimit` numbers: `src/common/decorators/rate-limit-options.type.ts`, `src/common/decorators/rate-limit-policy.type.ts`, `src/common/decorators/invalid-rate-limit-options.error.ts`, `src/common/decorators/route-rate-limit-key.ts`, `src/common/decorators/rate-limit.constants.ts`.
- **Rate limit declarations** — `src/common/decorators/to-rate-limit-declaration.ts` — what `@RateLimit` stores (`src/common/decorators/rate-limit-declaration.type.ts`, `src/common/decorators/rate-limit-settings.type.ts`); `src/common/decorators/resolve-rate-limit-policy.ts` turns one into a policy.
- **Rate limiting** — `src/infra/rate-limit/` — `RateLimitModule`: guard, pre-routing limiter, Redis storage, startup check. [whole folder: the throttler setup behind the entries below]
- **RateLimiter** — `src/infra/rate-limit/rate-limiter.ts` — `consume(options, key)`: a limit counted by a keyed hash the caller supplies.
- **RateLimit, SkipRateLimit** — `src/infra/rate-limit/rate-limit.decorator.ts`, `src/infra/rate-limit/skip-rate-limit.decorator.ts` — instead of the throttler's decorators (R19); numbers inline or `from` config.
- **Configured rate limits** — `src/config/rate-limit.config.ts` — `configured` (`src/config/configured-rate-limits.type.ts`).

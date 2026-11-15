# Registry: Authentication

One line per building block: name, path, purpose; the detail is in that file's doc comment. Listed by the index, `.claude/REGISTRY.md`. Paths are relative to `services/api/`.

- **Audiences** — `src/common/auth/audiences.constants.ts` — `AUDIENCES`; `src/common/auth/audience.type.ts`, `src/common/auth/staff-audience.type.ts` (the granted ones), `src/common/auth/route-audience.type.ts`, `src/common/auth/authenticated-user.type.ts`; plain TypeScript, importable from `domain/`. A lookup table: the Prisma enum `audience` and the route prefixes follow it.
- **resolveRouteAudience** — `src/common/auth/resolve-route-audience.ts` — a controller path's audience, `public`, or null.
- **AccessTokenVerifier** — `src/common/auth/access-token-verifier.interface.ts` — what the guard verifies with; `src/common/auth/access-token-verifier.constants.ts`, `src/common/auth/access-token-verification.type.ts`; implemented by auth.
- **AuthenticationGuard** — `src/common/guards/authentication.guard.ts` — the global guard: audience from the route, deny by default.
- **RouteAudienceCheck** — `src/common/guards/route-audience.check.ts` — startup fails on an endpoint with no audience and no `@Public()` (`src/common/guards/route-without-audience.error.ts`).
- **Public** — `src/common/decorators/public.decorator.ts` — a route outside the audience prefixes needing no sign-in; key `src/common/decorators/public-route.constants.ts`.
- **CurrentUser** — `src/common/decorators/current-user.decorator.ts` — the request's `AuthenticatedUser`.
- **AuthModule** — `src/modules/auth/index.ts` — nothing to call: use `@CurrentUser()` and the audience prefixes.

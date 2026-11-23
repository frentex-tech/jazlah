# Registry: Coverage

One line per building block: name, path, purpose; the detail is in that file's doc comment. Listed by the index, `.claude/REGISTRY.md`. Paths are relative to `services/api/`.

- **CoverageModule** — `src/modules/coverage/index.ts` — delivery zones as PostGIS polygons (admin CRUD, audited) and the coverage check; exports `CoverageService`, the `CoveringZone` type and `COVERAGE_REDIS` (the cache's client, replaced by e2e tests).
- **CoverageService** — `src/modules/coverage/coverage.service.ts` — `findZone(point)` (the active zone covering a point, or null) and `isCovered(point)`, on the cached active zones list; for addresses, checkout, kitchen assignment.

# Registry: Lists and pagination

One line per building block: name, path, purpose; the detail is in that file's doc comment. Listed by the index, `.claude/REGISTRY.md`. Paths are relative to `services/api/`.

- **PageQueryDto** — `src/common/dto/page-query.dto.ts` — the query of every list (`cursor`, `limit`), extended with a list's filters; cursor validated by `src/common/decorators/is-page-cursor.decorator.ts`.
- **Page types** — `src/common/pagination/page.type.ts` — `Page<T>`, `src/common/pagination/page-request.type.ts`, `src/common/pagination/page-cursor.type.ts`; plain TypeScript, importable from `domain/`.
- **PAGE_SIZE** — `src/common/pagination/page-size.constants.ts` — default 20, maximum 50.
- **Cursor codec** — `src/common/pagination/encode-page-cursor.ts` — the opaque cursor; `src/common/pagination/decode-page-cursor.ts` reads it back or null.
- **toPageRequest** — `src/common/pagination/to-page-request.ts` — a validated list query as a `PageRequest`.
- **toPage** — `src/common/pagination/to-page.ts` — a page from `limit + 1` rows, newest first.
- **toNextCursor** — `src/common/pagination/to-next-cursor.ts` — a page's `nextCursor` for the response.
- **keysetAfter** — `src/infra/database/keyset-after.ts` — the Prisma `where` of a keyset page; order `src/infra/database/keyset-order.constants.ts` (`KEYSET_ORDER`).
- **keysetPage** — `src/common/pagination/keyset-page.fake.ts` — the in-memory fakes' keyset pagination, for unit tests only (excluded from the build).

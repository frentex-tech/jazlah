# Registry: Storage integration

One line per building block: name, path, purpose; the detail is in that file's doc comment. Listed by the index, `.claude/REGISTRY.md`. Paths are relative to `services/api/`.

- **Storage** — `src/integrations/storage/` — presigned uploads and downloads, metadata, first bytes, copy inside the storage, delete. Providers: `s3` (`src/integrations/storage/providers/s3.provider.ts`), `disabled` (`src/integrations/storage/providers/disabled.provider.ts`, staging without storage), by `STORAGE_PROVIDER`; no fallback. Fake: `src/integrations/storage/providers/fake.provider.ts` via `testing.ts` (R22). [whole folder: reached through index.ts and testing.ts]

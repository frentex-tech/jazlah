# Registry: Users

One line per building block: name, path, purpose; the detail is in that file's doc comment. Listed by the index, `.claude/REGISTRY.md`. Paths are relative to `services/api/`.

- **UsersService** — `src/modules/users/users.service.ts` — find or create users by phone, staff access, `grantAdminAccess`, `grantVendorAccess` (inside the caller's transaction); types in `src/modules/users/index.ts`.

# Registry: Users

One line per building block: name, path, purpose; the detail is in that file's doc comment. Listed by the index, `.claude/REGISTRY.md`. Paths are relative to `services/api/`.

- **UsersService** — `src/modules/users/users.service.ts` — find or create users by phone, staff access, `grantAdminAccess`, `grantVendorAccess` (inside the caller's transaction), the user row locks `lockForWrite` (the root lock of a customer's data) and `lockForShare`, `hasActiveStaffAccess`, `markDeleted` (the tombstone); deleted accounts are left out of every read; types in `src/modules/users/index.ts`.

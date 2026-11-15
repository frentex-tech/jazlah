# Registry: Audit log

One line per building block: name, path, purpose; the detail is in that file's doc comment. Listed by the index, `.claude/REGISTRY.md`. Paths are relative to `services/api/`.

- **AuditLogWriter** — `src/infra/audit/audit-log-writer.ts` — writes an `audit_logs` entry inside the caller's transaction; `src/infra/audit/audit.module.ts`, `src/infra/audit/audit-entry.type.ts`, `src/infra/audit/audit-metadata.type.ts`.

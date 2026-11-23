import type { AuditEntry } from './audit-entry.type';

/**
 * AuditLogWriter in memory, for use case unit tests (excluded from the build): entries
 * are appended to `rows`, which is replaced on every write so a fake transaction can put
 * it back.
 */
export class InMemoryAuditLog {
  rows: readonly AuditEntry[] = [];

  write(entry: AuditEntry): Promise<void> {
    this.rows = [...this.rows, entry];
    return Promise.resolve();
  }
}

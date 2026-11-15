/** One audit entry as the fake records it (the shape AuditLogWriter.write takes). */
export type RecordedAuditEntry = Readonly<{
  actorId: string | null;
  action: string;
  entity: string;
  entityId: string;
  metadata?: Readonly<Record<string, string | number | boolean | null>>;
}>;

/** The audit log writer in memory, for the use case tests: entries are appended. */
export class InMemoryAuditLog {
  rows: readonly RecordedAuditEntry[] = [];

  write(entry: RecordedAuditEntry): Promise<void> {
    this.rows = [...this.rows, entry];
    return Promise.resolve();
  }
}

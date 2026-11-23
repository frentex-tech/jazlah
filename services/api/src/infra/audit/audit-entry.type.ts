import type { AuditMetadata } from './audit-metadata.type';

/** One audit log entry: who did what to which entity. */
export type AuditEntry = Readonly<{
  /** The user who acted; null for the system (a job, a command, a webhook). */
  actorId: string | null;
  /** What happened, `domain.entity.action` (`vendors.vendor.suspended`). */
  action: string;
  /** The kind of entity acted on (`vendor`). */
  entity: string;
  entityId: string;
  metadata?: AuditMetadata;
}>;

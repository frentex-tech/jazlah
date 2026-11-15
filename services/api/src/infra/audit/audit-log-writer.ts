import { Injectable } from '@nestjs/common';
import { DbContext } from '../database/db-context';
import { mapPrismaError } from '../database/map-prisma-error';
import type { AuditEntry } from './audit-entry.type';

/**
 * Writes entries to the append-only audit log (`audit_logs`), for sensitive actions
 * (FR-ADM-12): approvals, suspensions, commission changes. Call it inside the
 * transaction that makes the change: it queries through DbContext, so the entry joins
 * the open transaction and is committed or rolled back with the change. Entries are
 * never updated or deleted, and nothing here reads them back.
 */
@Injectable()
export class AuditLogWriter {
  constructor(private readonly db: DbContext) {}

  async write(entry: AuditEntry): Promise<void> {
    try {
      await this.db.client.auditLog.create({
        data: {
          actorId: entry.actorId,
          action: entry.action,
          entity: entry.entity,
          entityId: entry.entityId,
          metadata: entry.metadata ?? {},
        },
      });
    } catch (error) {
      mapPrismaError(error);
    }
  }
}

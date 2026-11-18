/** The audit actions of the coverage module (AuditLogWriter): every admin change to a zone. */
export const COVERAGE_AUDIT = {
  zoneCreated: { action: 'coverage.zone.created', entity: 'coverage_zone' },
  zoneUpdated: { action: 'coverage.zone.updated', entity: 'coverage_zone' },
  zoneDeleted: { action: 'coverage.zone.deleted', entity: 'coverage_zone' },
} as const;

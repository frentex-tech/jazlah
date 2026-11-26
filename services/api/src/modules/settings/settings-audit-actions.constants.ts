/** The audit actions of the settings module (AuditLogWriter): every admin change to the operations settings. */
export const SETTINGS_AUDIT = {
  operationsUpdated: {
    action: 'settings.operations.updated',
    entity: 'operations_settings',
  },
  orderingPaused: {
    action: 'settings.ordering.paused',
    entity: 'operations_settings',
  },
  orderingResumed: {
    action: 'settings.ordering.resumed',
    entity: 'operations_settings',
  },
} as const;

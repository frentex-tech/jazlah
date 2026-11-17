/**
 * What the auth module writes to the audit log (`action`, with `entity`): an account
 * deleted by its owner (FR-ACC-05). The entry names only ids and the reason's code: the
 * user is a tombstone by then.
 */
export const AUTH_AUDIT = {
  accountDeleted: { action: 'auth.account.deleted', entity: 'user' },
} as const;

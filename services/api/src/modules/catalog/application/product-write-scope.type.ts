/**
 * Whose products a write may touch: the signed-in vendor's (the id from the access
 * token, never the request), or JAZLA's own (the platform vendor's), written by admins.
 */
export type ProductWriteScope =
  | Readonly<{ kind: 'vendor'; vendorId: string }>
  | Readonly<{ kind: 'platform' }>;

/**
 * Whose products a read may return: the signed-in vendor's (from the access token), or
 * any vendor's (admins reviewing).
 */
export type ProductReadScope =
  Readonly<{ kind: 'vendor'; vendorId: string }> | Readonly<{ kind: 'any' }>;

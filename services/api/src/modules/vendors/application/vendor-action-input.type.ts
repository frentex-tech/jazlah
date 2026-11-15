/** Which vendor an admin acts on, and the admin (from the access token). */
export type VendorActionInput = Readonly<{
  vendorId: string;
  actorId: string;
}>;

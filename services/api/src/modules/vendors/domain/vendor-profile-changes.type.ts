/**
 * What a vendor may change in its own profile; a field left out stays as it is, and null
 * clears it.
 */
export type VendorProfileChanges = Readonly<{
  logoMediaId?: string | null;
  descriptionAr?: string | null;
  descriptionEn?: string | null;
}>;

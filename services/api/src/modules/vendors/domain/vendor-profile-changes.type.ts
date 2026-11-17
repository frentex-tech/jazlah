/**
 * Changes to a vendor's profile; a field left out stays as it is, and null clears it.
 * The vendor itself may change everything here except `city`, which only an admin sets
 * (the vendor's DTO has no such field; DECISIONS.md, "Vendors").
 */
export type VendorProfileChanges = Readonly<{
  logoMediaId?: string | null;
  coverMediaId?: string | null;
  descriptionAr?: string | null;
  descriptionEn?: string | null;
  /** E.164, a Saudi mobile or landline. */
  contactPhone?: string | null;
  /** Lowercase. */
  contactEmail?: string | null;
  /** 15 digits, starting and ending with 3. */
  vatNumber?: string | null;
  /** Admins only; 2 to 50 characters. Never null: a city is not removed. */
  city?: string;
}>;

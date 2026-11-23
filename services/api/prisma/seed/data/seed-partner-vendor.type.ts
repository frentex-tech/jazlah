/**
 * A partner vendor the seed creates from its approved application, as an admin's
 * approval does (names, business and bank details copied, the first commission
 * recorded, the applicant given vendor access), with a placeholder logo and cover photo
 * and fictitious contact details. Suspended
 * exactly when it has a suspension reason.
 */
export type SeedPartnerVendor = Readonly<{
  key: string;
  /** The approved SeedVendorApplication it comes from. */
  application: string;
  /** Basis points: 1250 is 12.5%. */
  commissionBasisPoints: number;
  /** The logo's colour, `#RRGGBB`. */
  logoColor: string;
  /** The cover photo's colour, `#RRGGBB`. */
  coverColor: string;
  /** Fictitious contact number, as typed (a mobile or a landline); stored in E.164. */
  contactPhone: string;
  /** On an example domain. */
  contactEmail: string;
  suspensionReason: string | null;
}>;

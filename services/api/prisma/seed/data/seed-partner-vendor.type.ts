/**
 * A partner vendor the seed creates from its approved application, as an admin's
 * approval does (names, business and bank details copied, the first commission
 * recorded, the applicant given vendor access), with a placeholder logo. Suspended
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
  suspensionReason: string | null;
}>;

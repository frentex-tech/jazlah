/** Extra facts about an audited action: plain values only, never secrets or unmasked personal data. */
export type AuditMetadata = Readonly<
  Record<string, string | number | boolean | null>
>;

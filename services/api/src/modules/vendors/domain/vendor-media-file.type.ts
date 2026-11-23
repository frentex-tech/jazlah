/** What the vendors module checks about an uploaded file before referring to it. */
export type VendorMediaFile = Readonly<{
  id: string;
  /** The user who uploaded it; null for files the system created. */
  ownerId: string | null;
  purpose: string;
  /** Only a ready file may be referred to. */
  isReady: boolean;
}>;

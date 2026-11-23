/** What the catalog checks about an uploaded file before using it as a product image. */
export type CatalogMediaFile = Readonly<{
  id: string;
  /** The user who uploaded it; null for files the system created. */
  ownerId: string | null;
  purpose: string;
  /** Only a ready file may be used. */
  isReady: boolean;
}>;

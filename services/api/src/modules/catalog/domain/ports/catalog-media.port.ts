import type { CatalogMediaFile } from '../catalog-media-file.type';

/** Injection token of the CatalogMedia port. */
export const CATALOG_MEDIA = Symbol('CATALOG_MEDIA');

/** The uploaded files the catalog refers to: product images. */
export interface CatalogMedia {
  /** The files with these ids; ids with no file are left out. */
  findFiles(ids: readonly string[]): Promise<CatalogMediaFile[]>;

  /** The public URL of each ready public file among `ids`, by id; no storage call. */
  publicUrls(ids: readonly string[]): Promise<ReadonlyMap<string, string>>;
}

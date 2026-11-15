import type { LocalizedText } from '@common/i18n/localized-text.type';

/** Injection token of the CatalogVendors port. */
export const CATALOG_VENDORS = Symbol('CATALOG_VENDORS');

/** What the catalog reads about vendors (through the vendors module's exports). */
export interface CatalogVendors {
  /** The platform vendor's id (JAZLA's products), or null before it is created. */
  platformVendorId(): Promise<string | null>;

  /** Each vendor's name by id; unknown ids are left out. */
  namesOf(ids: readonly string[]): Promise<ReadonlyMap<string, LocalizedText>>;
}

import type { LocalizedText } from '@common/i18n/localized-text.type';
import type { CatalogVendors } from '../ports/catalog-vendors.port';

/** CatalogVendors in memory: the platform vendor and names a test sets. */
export class InMemoryCatalogVendors implements CatalogVendors {
  platformId: string | null = null;
  readonly names = new Map<string, LocalizedText>();

  platformVendorId(): Promise<string | null> {
    return Promise.resolve(this.platformId);
  }

  namesOf(ids: readonly string[]): Promise<ReadonlyMap<string, LocalizedText>> {
    return Promise.resolve(
      new Map(
        ids.flatMap((id) => {
          const name = this.names.get(id);
          return name === undefined ? [] : [[id, name] as const];
        }),
      ),
    );
  }
}

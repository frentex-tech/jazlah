import { Injectable } from '@nestjs/common';
import type { LocalizedText } from '@common/i18n/localized-text.type';
import { VendorDirectory } from '@modules/vendors';
import type { CatalogVendors } from '../domain/ports/catalog-vendors.port';

/** The catalog's view of vendors, through the vendors module's VendorDirectory. */
@Injectable()
export class VendorDirectoryCatalogVendors implements CatalogVendors {
  constructor(private readonly directory: VendorDirectory) {}

  platformVendorId(): Promise<string | null> {
    return this.directory.platformVendorId();
  }

  namesOf(ids: readonly string[]): Promise<ReadonlyMap<string, LocalizedText>> {
    return ids.length === 0
      ? Promise.resolve(new Map())
      : this.directory.namesOf(ids);
  }
}

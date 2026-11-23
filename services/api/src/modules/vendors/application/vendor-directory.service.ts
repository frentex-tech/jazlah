import { Inject, Injectable } from '@nestjs/common';
import type { LocalizedText } from '@common/i18n/localized-text.type';
import {
  VENDOR_REPOSITORY,
  type VendorRepository,
} from '../domain/ports/vendor.repository.port';

/**
 * What other modules may read about vendors (exported): the platform vendor's id and
 * vendor names. Reads only; a vendor changes through this module's own use cases.
 */
@Injectable()
export class VendorDirectory {
  constructor(
    @Inject(VENDOR_REPOSITORY) private readonly vendors: VendorRepository,
  ) {}

  /** The platform vendor's id, or null before `pnpm vendor:create-platform` has run. */
  async platformVendorId(): Promise<string | null> {
    return (await this.vendors.findPlatform())?.id ?? null;
  }

  /** Each vendor's name by id, whatever its status; unknown ids are left out. */
  async namesOf(
    ids: readonly string[],
  ): Promise<ReadonlyMap<string, LocalizedText>> {
    const unique = [...new Set(ids)];
    return new Map(
      (await this.vendors.findByIds(unique)).map((vendor) => [
        vendor.id,
        vendor.name,
      ]),
    );
  }
}

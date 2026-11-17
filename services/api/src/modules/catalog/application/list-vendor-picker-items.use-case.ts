import { Inject, Injectable } from '@nestjs/common';
import {
  REFERENCE_LIST_REPOSITORY,
  type ReferenceListRepository,
} from '../domain/ports/reference-list.repository.port';
import type { NamedReference } from '../domain/named-reference.type';
import type { VendorPickerList } from '../domain/vendor-picker-list.type';

/**
 * What a vendor may choose on a product form from one list (meat types, cutting styles,
 * "without" items): every active entry, in both languages, oldest first. Whole, not
 * paged: short lists admins curate.
 */
@Injectable()
export class ListVendorPickerItemsUseCase {
  constructor(
    @Inject(REFERENCE_LIST_REPOSITORY)
    private readonly lists: ReferenceListRepository,
  ) {}

  async execute(list: VendorPickerList): Promise<NamedReference[]> {
    return (await this.lists.listActive(list)).map((item) => ({
      id: item.id,
      name: item.name,
    }));
  }
}

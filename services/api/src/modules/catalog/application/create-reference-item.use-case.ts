import { Inject, Injectable } from '@nestjs/common';
import {
  REFERENCE_LIST_REPOSITORY,
  type ReferenceListRepository,
} from '../domain/ports/reference-list.repository.port';
import type { NewReferenceItem } from '../domain/new-reference-item.type';
import type { ReferenceItem } from '../domain/reference-item.type';
import { ReferenceListEntry } from '../domain/reference-list-entry.entity';
import type { ReferenceList } from '../domain/reference-list.type';

/**
 * An admin adds an entry to one of the lists (FR-ADM-02); it starts active. A category
 * may take its display order (0 when left out); another list refuses one
 * (ReferenceListEntry.assertOrderable).
 */
@Injectable()
export class CreateReferenceItemUseCase {
  constructor(
    @Inject(REFERENCE_LIST_REPOSITORY)
    private readonly lists: ReferenceListRepository,
  ) {}

  async execute(
    list: ReferenceList,
    item: NewReferenceItem,
  ): Promise<ReferenceItem> {
    ReferenceListEntry.assertOrderable(list, item.sortOrder);
    return this.lists.create(list, item);
  }
}

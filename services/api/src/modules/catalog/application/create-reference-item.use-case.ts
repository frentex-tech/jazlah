import { Inject, Injectable } from '@nestjs/common';
import type { LocalizedText } from '@common/i18n/localized-text.type';
import {
  REFERENCE_LIST_REPOSITORY,
  type ReferenceListRepository,
} from '../domain/ports/reference-list.repository.port';
import type { ReferenceItem } from '../domain/reference-item.type';
import type { ReferenceList } from '../domain/reference-list.type';

/** An admin adds an entry to one of the lists (FR-ADM-02); it starts active. */
@Injectable()
export class CreateReferenceItemUseCase {
  constructor(
    @Inject(REFERENCE_LIST_REPOSITORY)
    private readonly lists: ReferenceListRepository,
  ) {}

  execute(list: ReferenceList, name: LocalizedText): Promise<ReferenceItem> {
    return this.lists.create(list, name);
  }
}

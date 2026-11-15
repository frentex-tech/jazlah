import { Inject, Injectable } from '@nestjs/common';
import type { Page } from '@common/pagination/page.type';
import type { PageRequest } from '@common/pagination/page-request.type';
import {
  REFERENCE_LIST_REPOSITORY,
  type ReferenceListRepository,
} from '../domain/ports/reference-list.repository.port';
import type { ReferenceItem } from '../domain/reference-item.type';
import type { ReferenceList } from '../domain/reference-list.type';

/**
 * The entries of one list, newest first: all of them or only active ones (admins), or
 * the active ones only (the public categories).
 */
@Injectable()
export class ListReferenceItemsUseCase {
  constructor(
    @Inject(REFERENCE_LIST_REPOSITORY)
    private readonly lists: ReferenceListRepository,
  ) {}

  execute(
    list: ReferenceList,
    filter: Readonly<{ isActive?: boolean }>,
    page: PageRequest,
  ): Promise<Page<ReferenceItem>> {
    return this.lists.list(list, filter, page);
  }
}

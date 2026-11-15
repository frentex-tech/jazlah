import { Inject, Injectable } from '@nestjs/common';
import { AppError } from '@common/errors/app-error';
import { ErrorCode } from '@common/errors/error-code.enum';
import {
  REFERENCE_LIST_REPOSITORY,
  type ReferenceListRepository,
} from '../domain/ports/reference-list.repository.port';
import type { ReferenceItem } from '../domain/reference-item.type';
import type { ReferenceItemChanges } from '../domain/reference-item-changes.type';
import type { ReferenceList } from '../domain/reference-list.type';

/**
 * An admin renames an entry or switches it on or off. An inactive entry can no longer be
 * chosen for a product; an inactive category hides its products from the public at once.
 * NOT_FOUND for an unknown id.
 */
@Injectable()
export class UpdateReferenceItemUseCase {
  constructor(
    @Inject(REFERENCE_LIST_REPOSITORY)
    private readonly lists: ReferenceListRepository,
  ) {}

  async execute(
    list: ReferenceList,
    id: string,
    changes: ReferenceItemChanges,
  ): Promise<ReferenceItem> {
    const item = await this.lists.update(list, id, changes);
    if (item === null) {
      throw new AppError(ErrorCode.NOT_FOUND);
    }
    return item;
  }
}

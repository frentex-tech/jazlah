import { Injectable } from '@nestjs/common';
import type { Page } from '@common/pagination/page.type';
import type { PageRequest } from '@common/pagination/page-request.type';
import { toPage } from '@common/pagination/to-page';
import { DbContext } from '@infra/database/db-context';
import { keysetAfter } from '@infra/database/keyset-after';
import { KEYSET_ORDER } from '@infra/database/keyset-order.constants';
import { mapPrismaError } from '@infra/database/map-prisma-error';
import type { NewReferenceItem } from '../domain/new-reference-item.type';
import type { ReferenceListRepository } from '../domain/ports/reference-list.repository.port';
import type { ReferenceItem } from '../domain/reference-item.type';
import type { ReferenceItemChanges } from '../domain/reference-item-changes.type';
import type { ReferenceList } from '../domain/reference-list.type';
import { toReferenceItem } from './reference-item.mapper';
import type { ReferenceTable } from './reference-table.type';

/**
 * The admin lists, one table each, through the same columns; categories also have a
 * display order, written through their own delegate (the use cases refuse an order for
 * another list).
 */
@Injectable()
export class PrismaReferenceListRepository implements ReferenceListRepository {
  constructor(private readonly db: DbContext) {}

  async create(
    list: ReferenceList,
    item: NewReferenceItem,
  ): Promise<ReferenceItem> {
    const data = { nameAr: item.name.ar, nameEn: item.name.en };
    try {
      return toReferenceItem(
        list === 'categories'
          ? await this.db.client.category.create({
              data: { ...data, sortOrder: item.sortOrder ?? 0 },
            })
          : await this.table(list).create({ data }),
      );
    } catch (error) {
      mapPrismaError(error);
    }
  }

  async update(
    list: ReferenceList,
    id: string,
    changes: ReferenceItemChanges,
  ): Promise<ReferenceItem | null> {
    try {
      const table = this.table(list);
      const data = {
        ...(changes.name === undefined
          ? {}
          : { nameAr: changes.name.ar, nameEn: changes.name.en }),
        ...(changes.isActive === undefined
          ? {}
          : { isActive: changes.isActive }),
      };
      const { count } =
        list === 'categories'
          ? await this.db.client.category.updateMany({
              where: { id },
              data: {
                ...data,
                ...(changes.sortOrder === undefined
                  ? {}
                  : { sortOrder: changes.sortOrder }),
              },
            })
          : await table.updateMany({ where: { id }, data });
      if (count === 0) {
        return null;
      }
      const row = await table.findUnique({ where: { id } });
      return row === null ? null : toReferenceItem(row);
    } catch (error) {
      mapPrismaError(error);
    }
  }

  async list(
    list: ReferenceList,
    filter: Readonly<{ isActive?: boolean }>,
    page: PageRequest,
  ): Promise<Page<ReferenceItem>> {
    try {
      const rows = await this.table(list).findMany({
        where: { ...filter, ...keysetAfter(page.cursor) },
        orderBy: [...KEYSET_ORDER],
        take: page.limit + 1,
      });
      return toPage(rows.map(toReferenceItem), page.limit);
    } catch (error) {
      mapPrismaError(error);
    }
  }

  async listActiveCategories(): Promise<ReferenceItem[]> {
    try {
      const rows = await this.db.client.category.findMany({
        where: { isActive: true },
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }, { id: 'asc' }],
      });
      return rows.map(toReferenceItem);
    } catch (error) {
      mapPrismaError(error);
    }
  }

  async findActiveIds(
    list: ReferenceList,
    ids: readonly string[],
  ): Promise<ReadonlySet<string>> {
    if (ids.length === 0) {
      return new Set();
    }
    try {
      const rows = await this.table(list).findMany({
        where: { id: { in: [...new Set(ids)] }, isActive: true },
      });
      return new Set(rows.map((row) => row.id));
    } catch (error) {
      mapPrismaError(error);
    }
  }

  /** The table of a list, read at each query (DbContext: the transaction's client inside one). */
  private table(list: ReferenceList): ReferenceTable {
    const client = this.db.client;
    const tables: Readonly<Record<ReferenceList, ReferenceTable>> = {
      categories: client.category,
      meat_types: client.meatType,
      cutting_styles: client.cuttingStyle,
      exclusion_items: client.exclusionItem,
    };
    return tables[list];
  }
}

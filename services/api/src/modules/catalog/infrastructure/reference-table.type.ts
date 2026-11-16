import type { KEYSET_ORDER } from '@infra/database/keyset-order.constants';
import type { keysetAfter } from '@infra/database/keyset-after';
import type { ReferenceRow } from './reference-row.type';

/**
 * The part of a Prisma delegate the admin list repository uses. The four list tables
 * have the same columns, so each delegate fits it and one repository serves them all.
 */
export type ReferenceTable = Readonly<{
  create(args: {
    data: { nameAr: string; nameEn: string };
  }): Promise<ReferenceRow>;
  updateMany(args: {
    where: { id: string };
    data: { nameAr?: string; nameEn?: string; isActive?: boolean };
  }): Promise<{ count: number }>;
  findUnique(args: { where: { id: string } }): Promise<ReferenceRow | null>;
  findMany(args: {
    where: { isActive?: boolean; id?: { in: string[] } } & ReturnType<
      typeof keysetAfter
    >;
    orderBy?: (typeof KEYSET_ORDER)[number][];
    take?: number;
  }): Promise<ReferenceRow[]>;
}>;

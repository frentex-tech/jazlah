import type { ReferenceItem } from '../domain/reference-item.type';
import type { ReferenceRow } from './reference-row.type';

/** A row of an admin list table as the domain's entry. */
export function toReferenceItem(row: ReferenceRow): ReferenceItem {
  return {
    id: row.id,
    name: { ar: row.nameAr, en: row.nameEn },
    isActive: row.isActive,
    sortOrder: row.sortOrder ?? null,
    imageMediaId: row.imageMediaId ?? null,
    createdAt: row.createdAt,
  };
}

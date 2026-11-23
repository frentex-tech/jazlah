import type { SeedReferenceItem } from './seed-reference-item.type';

/** A category the seed creates: an admin list entry with its display order (lower first). */
export type SeedCategory = SeedReferenceItem & Readonly<{ sortOrder: number }>;

import type { ReferenceItem } from '../domain/reference-item.type';

/** A list entry with its image's public URL (null without an image). */
export type ReferenceItemView = Readonly<{
  item: ReferenceItem;
  imageUrl: string | null;
}>;

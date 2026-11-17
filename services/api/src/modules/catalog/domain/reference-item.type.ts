import type { LocalizedText } from '@common/i18n/localized-text.type';

/**
 * One entry of an admin list (a category, a meat type, a cutting style, a "without"
 * item). An inactive entry cannot be chosen for a product any more, and an inactive
 * category hides its products from the public.
 */
export type ReferenceItem = Readonly<{
  id: string;
  name: LocalizedText;
  isActive: boolean;
  /** A category's display order, lower first; null for the lists without one. */
  sortOrder: number | null;
  /**
   * A category's image, a ready `catalog.category-image` file; null without one, and for
   * the lists without images.
   */
  imageMediaId: string | null;
  createdAt: Date;
}>;

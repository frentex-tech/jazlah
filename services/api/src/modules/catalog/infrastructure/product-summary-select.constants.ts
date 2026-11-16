import type { Prisma } from '@infra/database/generated/prisma/client';

/** What a product list reads per row: the card's fields and the first image. */
export const PRODUCT_SUMMARY_SELECT = {
  id: true,
  vendorId: true,
  categoryId: true,
  meatTypeId: true,
  status: true,
  isAvailable: true,
  nameAr: true,
  nameEn: true,
  minPriceHalalas: true,
  createdAt: true,
  images: { where: { position: 0 }, select: { mediaId: true } },
} satisfies Prisma.ProductSelect;

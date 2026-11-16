import type { Prisma } from '@infra/database/generated/prisma/client';

/**
 * What a product's details read with it: the names it refers to and its options, in
 * display order (images and sizes by position; cuttings and exclusions as added).
 */
export const PRODUCT_DETAILS_INCLUDE = {
  category: true,
  meatType: true,
  images: { orderBy: { position: 'asc' } },
  sizes: { orderBy: { position: 'asc' } },
  cuttings: {
    include: { cuttingStyle: true },
    orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
  },
  packagings: { orderBy: { packaging: 'asc' } },
  exclusions: {
    include: { exclusionItem: true },
    orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
  },
} satisfies Prisma.ProductInclude;

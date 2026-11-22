import { PACKAGING_EXTRA_PRICES } from './data/packaging-extra-prices.constants';
import { Money } from '@common/money/money';
import { SEED_PRODUCTS } from './data/products.constants';
import type { SeedProduct } from './data/seed-product.type';
import { buildChangeContent } from './build-change-content';
import { ensureSeedFile } from './ensure-seed-file';
import { pickId } from './pick-id';
import { productImageFile } from './product-image-file';
import { productSizeId } from './product-size-id';
import type { SeedContext } from './seed-context.type';
import { seedId } from './seed-id';
import { seedTime } from './seed-time';

/**
 * Every seeded product with its images, sizes, cuttings, packagings and "without"
 * items, and its pending change request if it has one, each product in one transaction
 * and only when its id is free: a product a developer edited is left as it is.
 *
 * The review fields follow the status as the catalog writes them (ProductTransition):
 * submitted for a partner's product under review or decided, reviewed by the admin
 * development account when published or rejected, published directly for the platform
 * vendor's. The lowest size price is stored as the catalog keeps it (Money.min).
 *
 * `vendorIds` maps `platform` and each partner key to a vendor id; `ownerIds` the same
 * keys to the user who uploads its images and requests its changes.
 */
export async function seedProducts(
  context: SeedContext,
  vendorIds: ReadonlyMap<string, string>,
  ownerIds: ReadonlyMap<string, string>,
  adminId: string,
): Promise<void> {
  for (const [index, product] of SEED_PRODUCTS.entries()) {
    await seedProduct(context, product, index, {
      vendorId: pickId(vendorIds, product.vendor, 'vendor'),
      ownerId: pickId(ownerIds, product.vendor, 'vendor owner'),
      adminId,
    });
  }
}

async function seedProduct(
  context: SeedContext,
  product: SeedProduct,
  index: number,
  people: Readonly<{ vendorId: string; ownerId: string; adminId: string }>,
): Promise<void> {
  const { db, transactions, tally } = context;
  const id = seedId(`product:${product.key}`);
  const files = Array.from({ length: product.images }, (_, position) =>
    productImageFile(product, position, people.ownerId),
  );
  // Storage first, outside the transaction (database.md, Transactions).
  for (const file of files) {
    await ensureSeedFile(context, file);
  }
  const imageIds = files.map((file) => file.id);
  const createdAt = seedTime(48 + index);
  const isPlatform = product.vendor === 'platform';
  const submitted =
    product.status !== 'draft' &&
    !(isPlatform && product.status === 'published');
  const reviewed =
    product.status === 'published' || product.status === 'rejected';
  const reviewedAt = seedTime(48 + index + 2);
  const minPrice = Money.min(
    product.sizes.map((size) => Money.of(size.priceHalalas)),
  );

  const created = await transactions.run(async () => {
    const existing = await db.client.product.findUnique({
      where: { id },
      select: { id: true },
    });
    if (existing !== null) {
      return false;
    }
    await db.client.product.create({
      data: {
        id,
        vendorId: people.vendorId,
        categoryId: seedId(`category:${product.category}`),
        meatTypeId:
          product.meatType === null
            ? null
            : seedId(`meat-type:${product.meatType}`),
        nameAr: product.name.ar,
        nameEn: product.name.en,
        descriptionAr: product.description.ar,
        descriptionEn: product.description.en,
        status: product.status,
        isAvailable: product.isAvailable,
        fulfilment: product.fulfilment,
        minPriceHalalas: minPrice === null ? null : minPrice.halalas,
        rejectionReason: product.rejectionReason,
        submittedAt: submitted ? seedTime(48 + index + 1) : null,
        reviewedAt: reviewed ? reviewedAt : null,
        reviewedById: reviewed ? people.adminId : null,
        publishedAt: product.status === 'published' ? reviewedAt : null,
        createdAt,
        images: {
          create: imageIds.map((mediaId, position) => ({
            id: seedId(`product-image:${product.key}:${position}`),
            mediaId,
            position,
            createdAt,
          })),
        },
        sizes: {
          create: product.sizes.map((size, position) => ({
            id: productSizeId(product.key, position),
            approxWeightGrams: size.approxWeightGrams,
            priceHalalas: size.priceHalalas,
            tagAr: size.tag === null ? null : size.tag.ar,
            tagEn: size.tag === null ? null : size.tag.en,
            isAvailable: size.isAvailable ?? true,
            position,
            createdAt,
          })),
        },
        cuttings: {
          create: product.cuttings.map((cutting) => ({
            id: seedId(`product-cutting:${product.key}:${cutting.style}`),
            cuttingStyleId: seedId(`cutting-style:${cutting.style}`),
            extraPriceHalalas: cutting.extraPriceHalalas,
            createdAt,
          })),
        },
        packagings: {
          create: product.packagings.map((packaging) => ({
            id: seedId(`product-packaging:${product.key}:${packaging}`),
            packaging,
            extraPriceHalalas: PACKAGING_EXTRA_PRICES[packaging],
            createdAt,
          })),
        },
        exclusions: {
          create: product.exclusions.map((key) => ({
            id: seedId(`product-exclusion:${product.key}:${key}`),
            exclusionItemId: seedId(`exclusion-item:${key}`),
            createdAt,
          })),
        },
        changeRequests: {
          create:
            product.pendingChange === null
              ? []
              : [
                  {
                    id: seedId(`product-change-request:${product.key}:1`),
                    requestedById: people.ownerId,
                    status: 'pending',
                    content: buildChangeContent(
                      product,
                      product.pendingChange,
                      imageIds,
                    ),
                    createdAt: seedTime(48 + index + 24),
                  },
                ],
        },
      },
    });
    return true;
  });
  tally.one('products', created);
  if (product.pendingChange !== null) {
    tally.one('product change requests', created);
  }
}

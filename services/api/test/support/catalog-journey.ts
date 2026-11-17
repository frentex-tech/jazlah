import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import type { App } from 'supertest/types';
import { PrismaService } from '@infra/database/prisma.service';
import type { TestUser, VendorJourney } from './vendor-journey';

/** The list entries a product refers to, created for one test. */
export type CatalogOptions = Readonly<{
  categoryId: string;
  meatTypeId: string;
  cuttingStyleId: string;
  exclusionItemId: string;
}>;

type ListPath =
  'categories' | 'meat-types' | 'cutting-styles' | 'exclusion-items';

const LIST_PATHS: readonly ListPath[] = [
  'categories',
  'meat-types',
  'cutting-styles',
  'exclusion-items',
];

/**
 * Catalog steps for the e2e tests, through the real endpoints, on top of VendorJourney
 * (vendors, admins, uploads). Everything created is remembered so `cleanUp` deletes it,
 * children before parents; call it before VendorJourney's (products refer to vendors).
 */
export class CatalogJourney {
  private readonly productIds: string[] = [];
  private readonly listItems: { path: ListPath; id: string }[] = [];
  private readonly ruleIds: string[] = [];
  private labels = 0;

  constructor(
    private readonly app: INestApplication<App>,
    readonly vendors: VendorJourney,
  ) {}

  get http(): ReturnType<typeof request> {
    return request(this.app.getHttpServer());
  }

  /** Creates an active entry of an admin list, with a name of its own. */
  async listItem(admin: TestUser, path: ListPath): Promise<string> {
    this.labels += 1;
    const res = await this.http
      .post(`/v1/admin/lists/${path}`)
      .set('Authorization', `Bearer ${admin.accessToken}`)
      .send({ name: { ar: `عنصر ${this.labels}`, en: `Item ${this.labels}` } })
      .expect(201);
    const id = (res.body as { id: string }).id;
    this.listItems.push({ path, id });
    return id;
  }

  /** One fresh entry of each list. */
  async options(admin: TestUser): Promise<CatalogOptions> {
    return {
      categoryId: await this.listItem(admin, 'categories'),
      meatTypeId: await this.listItem(admin, 'meat-types'),
      cuttingStyleId: await this.listItem(admin, 'cutting-styles'),
      exclusionItemId: await this.listItem(admin, 'exclusion-items'),
    };
  }

  /** Remembers a rule created by a test, for cleanUp. */
  rememberRule(id: string): void {
    this.ruleIds.push(id);
  }

  /** Remembers a product created by a test, for cleanUp. */
  rememberProduct(id: string): void {
    this.productIds.push(id);
  }

  /** A confirmed product image uploaded by `user` through its audience's endpoints. */
  image(user: TestUser, audience: 'vendor' | 'admin'): Promise<string> {
    return this.vendors.uploadedFile(
      user,
      audience,
      'catalog.product-image',
      'png',
    );
  }

  /** A complete product body: one image, one size, one cutting, trays, one exclusion. */
  body(
    options: CatalogOptions,
    imageIds: string[],
    overrides: Record<string, unknown> = {},
  ): Record<string, unknown> {
    return {
      name: { ar: 'نعيمي', en: 'Naimi lamb' },
      description: { ar: 'طازج يوميًا', en: 'Fresh daily' },
      categoryId: options.categoryId,
      meatTypeId: options.meatTypeId,
      imageMediaIds: imageIds,
      sizes: [
        {
          approxWeightGrams: 8000,
          priceHalalas: 95000,
          tag: { ar: 'يجزئ العقيقة', en: 'Enough for an aqiqah' },
        },
      ],
      cuttings: [
        { cuttingStyleId: options.cuttingStyleId, extraPriceHalalas: 1500 },
      ],
      packagings: [{ packaging: 'trays', extraPriceHalalas: 300 }],
      exclusionItemIds: [options.exclusionItemId],
      fulfilment: 'both',
      ...overrides,
    };
  }

  /** A vendor's complete draft; returns its id. */
  async draft(
    owner: TestUser,
    options: CatalogOptions,
    overrides: Record<string, unknown> = {},
  ): Promise<string> {
    const image = await this.image(owner, 'vendor');
    const res = await this.http
      .post('/v1/vendor/products')
      .set('Authorization', `Bearer ${owner.accessToken}`)
      .send(this.body(options, [image], overrides))
      .expect(201);
    const id = (res.body as { id: string }).id;
    this.productIds.push(id);
    return id;
  }

  /** A vendor's product, submitted and approved by `admin`; returns its id. */
  async published(
    owner: TestUser,
    admin: TestUser,
    options: CatalogOptions,
    overrides: Record<string, unknown> = {},
  ): Promise<string> {
    const id = await this.draft(owner, options, overrides);
    await this.http
      .post(`/v1/vendor/products/${id}/submit`)
      .set('Authorization', `Bearer ${owner.accessToken}`)
      .expect(200);
    await this.http
      .post(`/v1/admin/products/${id}/approve`)
      .set('Authorization', `Bearer ${admin.accessToken}`)
      .expect(200);
    return id;
  }

  /** Deletes the products (their options and change requests with them), rules and entries. */
  async cleanUp(): Promise<void> {
    const prisma = this.app.get(PrismaService);
    const requests = await prisma.productChangeRequest.findMany({
      where: { productId: { in: this.productIds } },
      select: { id: true },
    });
    await prisma.auditLog.deleteMany({
      where: {
        entityId: {
          in: [...this.productIds, ...requests.map((row) => row.id)],
        },
      },
    });
    await prisma.product.deleteMany({ where: { id: { in: this.productIds } } });
    await prisma.cuttingPackagingIncompatibility.deleteMany({
      where: {
        OR: [
          { id: { in: this.ruleIds } },
          {
            cuttingStyleId: {
              in: this.listItems
                .filter((item) => item.path === 'cutting-styles')
                .map((item) => item.id),
            },
          },
        ],
      },
    });
    for (const path of LIST_PATHS) {
      const ids = this.listItems
        .filter((item) => item.path === path)
        .map((item) => item.id);
      if (path === 'categories') {
        await prisma.category.deleteMany({ where: { id: { in: ids } } });
      } else if (path === 'meat-types') {
        await prisma.meatType.deleteMany({ where: { id: { in: ids } } });
      } else if (path === 'cutting-styles') {
        await prisma.cuttingStyle.deleteMany({ where: { id: { in: ids } } });
      } else {
        await prisma.exclusionItem.deleteMany({ where: { id: { in: ids } } });
      }
    }
  }
}

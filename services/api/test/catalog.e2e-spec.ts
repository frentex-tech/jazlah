import { randomUUID } from 'node:crypto';
import type { INestApplication } from '@nestjs/common';
import type { Response, Test } from 'supertest';
import type { App } from 'supertest/types';
import type { ErrorResponseBody } from '@common/filters/error-response-body.interface';
import { PrismaService } from '@infra/database/prisma.service';
import { SMS_PORTS } from '@integrations/sms';
import { FakeSmsProvider } from '@integrations/sms/testing';
import { STORAGE_PORT } from '@integrations/storage';
import { FakeStorageProvider } from '@integrations/storage/testing';
import { CreatePlatformVendorUseCase } from '@modules/vendors';
import { CatalogJourney } from './support/catalog-journey';
import { createHttpApp } from './support/create-http-app';
import { holdRowLock } from './support/row-lock';
import { VendorJourney, type TestUser } from './support/vendor-journey';

type ProductBody = {
  id: string;
  vendorId: string;
  status: string;
  isAvailable: boolean;
  fulfilment: string;
  name: { ar: string; en: string };
  minPriceHalalas: number | null;
  sizes: { id: string; priceHalalas: number }[];
  images: { mediaId: string; url: string | null }[];
  rejectionReason: string | null;
  changeRequest: {
    id: string;
    status: string;
    rejectionReason: string | null;
    content: { name: { en: string } };
  } | null;
};
type Page<T> = { items: T[]; nextCursor: string | null };
type CategoryList = { items: { id: string; sortOrder: number | null }[] };
type Card = { id: string; vendor: { id: string; name: { en: string } | null } };

const errorCode = (body: unknown): string => (body as ErrorResponseBody).code;

/**
 * The catalog end to end: the admin lists and rules, vendors' products and their
 * review, change requests, JAZLA's own products and public browsing, against the real
 * application and database with the fake sms and storage providers. Each test makes its
 * own vendors, lists and products, and filters public lists by its own vendor or
 * category, so suites running beside it do not interfere.
 */
describe('Catalog (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let vendors: VendorJourney;
  let catalog: CatalogJourney;

  beforeAll(async () => {
    const sms = new FakeSmsProvider();
    const storage = new FakeStorageProvider();
    app = await createHttpApp({
      overrides: [
        { provide: SMS_PORTS, useValue: [sms] },
        { provide: STORAGE_PORT, useValue: storage },
      ],
    });
    prisma = app.get(PrismaService);
    vendors = new VendorJourney(app, sms, storage);
    catalog = new CatalogJourney(app, vendors);
  });

  afterAll(async () => {
    if (app === undefined) {
      return;
    }
    await catalog.cleanUp();
    await vendors.cleanUp();
    await app.close();
  });

  const bearer = (user: TestUser): [string, string] => [
    'Authorization',
    `Bearer ${user.accessToken}`,
  ];

  /** A vendor, its owner signed in, an admin and a fresh set of list entries. */
  async function setUp(label = 'vendor') {
    const { vendorId, owner, admin } = await vendors.approvedVendor(label);
    const options = await catalog.options(admin);
    return { vendorId, owner, admin, options };
  }

  const publicIds = async (query: string): Promise<string[]> => {
    const res = await catalog.http
      .get(`/v1/public/products?${query}`)
      .expect(200);
    return (res.body as Page<Card>).items.map((card) => card.id);
  };

  describe('admin lists and rules', () => {
    it('creates, lists, renames and switches off list entries', async () => {
      const admin = await vendors.admin();
      const id = await catalog.listItem(admin, 'meat-types');

      const renamed = await catalog.http
        .patch(`/v1/admin/lists/meat-types/${id}`)
        .set(...bearer(admin))
        .send({ name: { ar: 'حاشي', en: 'Camel' }, isActive: false })
        .expect(200);
      const inactive = await catalog.http
        .get('/v1/admin/lists/meat-types?isActive=false&limit=50')
        .set(...bearer(admin))
        .expect(200);

      expect(renamed.body).toMatchObject({
        id,
        name: { ar: 'حاشي', en: 'Camel' },
        isActive: false,
      });
      expect(
        (inactive.body as Page<{ id: string }>).items.map((item) => item.id),
      ).toContain(id);
    });

    it('refuses an unknown list, an invalid name, an unknown entry and a bad filter', async () => {
      const admin = await vendors.admin();

      const unknownList = await catalog.http
        .post('/v1/admin/lists/colours')
        .set(...bearer(admin))
        .send({ name: { ar: 'أحمر', en: 'Red' } })
        .expect(400);
      const badName = await catalog.http
        .post('/v1/admin/lists/categories')
        .set(...bearer(admin))
        .send({ name: { ar: 'أ', en: '' } })
        .expect(400);
      const unknownEntry = await catalog.http
        .patch(`/v1/admin/lists/categories/${randomUUID()}`)
        .set(...bearer(admin))
        .send({ isActive: false })
        .expect(404);
      const badFilter = await catalog.http
        .get('/v1/admin/lists/categories?isActive=maybe')
        .set(...bearer(admin))
        .expect(400);

      expect(unknownList.body).toMatchObject({ details: [{ field: 'list' }] });
      expect(errorCode(badName.body)).toBe('VALIDATION_FAILED');
      expect(errorCode(unknownEntry.body)).toBe('NOT_FOUND');
      expect(badFilter.body).toMatchObject({
        details: [{ field: 'isActive' }],
      });
    });

    it('adds, lists and removes a cutting and packaging rule; the same pair twice is CONFLICT', async () => {
      const admin = await vendors.admin();
      const cut = await catalog.listItem(admin, 'cutting-styles');
      const add = () =>
        catalog.http
          .post('/v1/admin/cutting-packaging-incompatibilities')
          .set(...bearer(admin))
          .send({ cuttingStyleId: cut, packaging: 'vacuum' });

      const created = await add().expect(201);
      const ruleId = (created.body as { id: string }).id;
      catalog.rememberRule(ruleId);
      const twice = await add().expect(409);
      const listed = await catalog.http
        .get('/v1/admin/cutting-packaging-incompatibilities?limit=50')
        .set(...bearer(admin))
        .expect(200);
      await catalog.http
        .delete(`/v1/admin/cutting-packaging-incompatibilities/${ruleId}`)
        .set(...bearer(admin))
        .expect(204);
      const gone = await catalog.http
        .delete(`/v1/admin/cutting-packaging-incompatibilities/${ruleId}`)
        .set(...bearer(admin))
        .expect(404);
      const badPackaging = await catalog.http
        .post('/v1/admin/cutting-packaging-incompatibilities')
        .set(...bearer(admin))
        .send({ cuttingStyleId: cut, packaging: 'box' })
        .expect(400);

      expect(errorCode(twice.body)).toBe('CONFLICT');
      expect(
        (listed.body as Page<{ id: string }>).items.map((rule) => rule.id),
      ).toContain(ruleId);
      expect(errorCode(gone.body)).toBe('NOT_FOUND');
      expect(badPackaging.body).toMatchObject({
        details: [{ field: 'packaging' }],
      });
    });
  });

  describe('a vendor and its products', () => {
    it('creates a draft, reads it, lists it, edits it and submits it to review', async () => {
      const { owner, options } = await setUp();
      const id = await catalog.draft(owner, options);

      const read = await catalog.http
        .get(`/v1/vendor/products/${id}`)
        .set(...bearer(owner))
        .expect(200);
      const listed = await catalog.http
        .get('/v1/vendor/products?status=draft')
        .set(...bearer(owner))
        .expect(200);
      const image = (read.body as ProductBody).images[0].mediaId;
      const edited = await catalog.http
        .put(`/v1/vendor/products/${id}`)
        .set(...bearer(owner))
        .send(
          catalog.body(options, [image], {
            fulfilment: undefined,
            sizes: [
              { approxWeightGrams: 4000, priceHalalas: 50000 },
              { approxWeightGrams: 8000, priceHalalas: 95000 },
            ],
          }),
        )
        .expect(200);
      const submitted = await catalog.http
        .post(`/v1/vendor/products/${id}/submit`)
        .set(...bearer(owner))
        .expect(200);
      const underReview = await catalog.http
        .put(`/v1/vendor/products/${id}`)
        .set(...bearer(owner))
        .send(catalog.body(options, [image], { fulfilment: undefined }))
        .expect(409);

      expect(read.body).toMatchObject({
        status: 'draft',
        name: { ar: 'نعيمي', en: 'Naimi lamb' },
        minPriceHalalas: 95000,
        fulfilment: 'both',
        packagings: ['trays'],
        changeRequest: null,
      });
      expect((read.body as ProductBody).images[0]?.url).toEqual(
        expect.any(String),
      );
      expect(
        (listed.body as Page<{ id: string }>).items.map((card) => card.id),
      ).toEqual([id]);
      expect((edited.body as ProductBody).minPriceHalalas).toBe(50000);
      expect((submitted.body as ProductBody).status).toBe('pending_review');
      expect(errorCode(underReview.body)).toBe('PRODUCT_NOT_EDITABLE');
    });

    it('refuses invalid product bodies', async () => {
      const { owner, options } = await setUp();
      const image = await catalog.image(owner, 'vendor');
      const send = (overrides: Record<string, unknown>) =>
        catalog.http
          .post('/v1/vendor/products')
          .set(...bearer(owner))
          .send(catalog.body(options, [image], overrides))
          .expect(400);

      const badPrice = await send({
        sizes: [{ approxWeightGrams: 1000, priceHalalas: 12.5 }],
      });
      const badPackaging = await send({ packagings: ['box'] });
      const duplicateCut = await send({
        cuttings: [
          { cuttingStyleId: options.cuttingStyleId, extraPriceHalalas: 0 },
          { cuttingStyleId: options.cuttingStyleId, extraPriceHalalas: 1 },
        ],
      });
      const unknownCategory = await send({ categoryId: randomUUID() });
      const badFulfilment = await send({ fulfilment: 'drone' });

      expect(badPrice.body).toMatchObject({
        details: [{ field: 'sizes.0.priceHalalas' }],
      });
      expect(badPackaging.body).toMatchObject({
        details: [{ field: 'packagings' }],
      });
      expect(duplicateCut.body).toMatchObject({
        details: [{ field: 'cuttings' }],
      });
      expect(unknownCategory.body).toMatchObject({
        details: [{ field: 'categoryId', constraints: ['isActiveCategory'] }],
      });
      expect(badFulfilment.body).toMatchObject({
        details: [{ field: 'fulfilment' }],
      });
    });

    it('refuses to submit without a size and an image, or with an incompatible pair (422)', async () => {
      const { owner, admin, options } = await setUp();
      const empty = await catalog.http
        .post('/v1/vendor/products')
        .set(...bearer(owner))
        .send(catalog.body(options, [], { sizes: [], cuttings: [] }))
        .expect(201);
      const emptyId = (empty.body as { id: string }).id;
      catalog.rememberProduct(emptyId);
      const rule = await catalog.http
        .post('/v1/admin/cutting-packaging-incompatibilities')
        .set(...bearer(admin))
        .send({ cuttingStyleId: options.cuttingStyleId, packaging: 'trays' })
        .expect(201);
      catalog.rememberRule((rule.body as { id: string }).id);
      const paired = await catalog.draft(owner, options);

      const missing = await catalog.http
        .post(`/v1/vendor/products/${emptyId}/submit`)
        .set(...bearer(owner))
        .expect(422);
      const incompatible = await catalog.http
        .post(`/v1/vendor/products/${paired}/submit`)
        .set(...bearer(owner))
        .expect(422);

      expect(missing.body).toMatchObject({
        code: 'PRODUCT_NOT_SUBMITTABLE',
        details: { reasons: ['NO_SIZE', 'NO_IMAGE'] },
      });
      expect(incompatible.body).toMatchObject({
        code: 'PRODUCT_NOT_SUBMITTABLE',
        details: {
          reasons: ['INCOMPATIBLE_CUTTING_PACKAGING'],
          pairs: [
            { cuttingStyleId: options.cuttingStyleId, packaging: 'trays' },
          ],
        },
      });
    });

    it("gets the same 404 for vendor A's product as for a random id, on every vendor endpoint", async () => {
      const a = await setUp('vendor-a');
      const b = await vendors.approvedVendor('vendor-b');
      const productId = await catalog.draft(a.owner, a.options);
      const image = await catalog.image(b.owner, 'vendor');
      const calls = (id: string) => [
        catalog.http.get(`/v1/vendor/products/${id}`),
        catalog.http
          .put(`/v1/vendor/products/${id}`)
          .send(catalog.body(a.options, [image], { fulfilment: undefined })),
        catalog.http.post(`/v1/vendor/products/${id}/submit`),
        catalog.http
          .patch(`/v1/vendor/products/${id}/availability`)
          .send({ isAvailable: false }),
        catalog.http
          .patch(`/v1/vendor/products/${id}/fulfilment`)
          .send({ fulfilment: 'pickup' }),
        catalog.http.patch(`/v1/vendor/products/${id}/prices`).send({}),
      ];
      const answer = async (id: string) =>
        Promise.all(
          calls(id).map(async (call) => {
            const res = await call.set(...bearer(b.owner));
            const { code, message } = res.body as ErrorResponseBody;
            return { status: res.status, code, message };
          }),
        );

      const theirs = await answer(productId);
      const random = await answer(randomUUID());

      expect(theirs).toEqual(random);
      expect(theirs.every((res) => res.status === 404)).toBe(true);
      expect(
        (
          await catalog.http
            .get('/v1/vendor/products')
            .set(...bearer(b.owner))
            .expect(200)
        ).body,
      ).toMatchObject({ items: [] });
    });

    it('changes availability, fulfilment and prices of a published product at once, prices audited', async () => {
      const { owner, admin, options, vendorId } = await setUp();
      const id = await catalog.published(owner, admin, options);
      const live = (
        await catalog.http
          .get(`/v1/vendor/products/${id}`)
          .set(...bearer(owner))
          .expect(200)
      ).body as ProductBody;
      const sizeId = live.sizes[0].id;

      const priced = await catalog.http
        .patch(`/v1/vendor/products/${id}/prices`)
        .set(...bearer(owner))
        .send({
          sizes: [{ sizeId, priceHalalas: 89000 }],
          cuttings: [
            { cuttingStyleId: options.cuttingStyleId, extraPriceHalalas: 0 },
          ],
        })
        .expect(200);
      const pickup = await catalog.http
        .patch(`/v1/vendor/products/${id}/fulfilment`)
        .set(...bearer(owner))
        .send({ fulfilment: 'pickup' })
        .expect(200);
      const hidden = await catalog.http
        .patch(`/v1/vendor/products/${id}/availability`)
        .set(...bearer(owner))
        .send({ isAvailable: false })
        .expect(200);
      const badPrices = await catalog.http
        .patch(`/v1/vendor/products/${id}/prices`)
        .set(...bearer(owner))
        .send({ sizes: [{ sizeId: randomUUID(), priceHalalas: 1 }] })
        .expect(400);
      const badFulfilment = await catalog.http
        .patch(`/v1/vendor/products/${id}/fulfilment`)
        .set(...bearer(owner))
        .send({ fulfilment: 'drone' })
        .expect(400);
      const badAvailability = await catalog.http
        .patch(`/v1/vendor/products/${id}/availability`)
        .set(...bearer(owner))
        .send({ isAvailable: 'no' })
        .expect(400);

      expect(priced.body).toMatchObject({
        status: 'published',
        minPriceHalalas: 89000,
        changeRequest: null,
      });
      expect((pickup.body as ProductBody).fulfilment).toBe('pickup');
      expect((hidden.body as ProductBody).isAvailable).toBe(false);
      expect(badPrices.body).toMatchObject({
        details: [
          { field: 'sizes.0.sizeId', constraints: ['isSizeOfProduct'] },
        ],
      });
      expect(badFulfilment.body).toMatchObject({
        details: [{ field: 'fulfilment' }],
      });
      expect(badAvailability.body).toMatchObject({
        details: [{ field: 'isAvailable' }],
      });
      expect(
        (
          await prisma.auditLog.findMany({
            where: { entityId: id, action: 'catalog.product.price_changed' },
            orderBy: { createdAt: 'asc' },
          })
        ).map((entry) => entry.metadata),
      ).toEqual(
        expect.arrayContaining([
          { sizeId, previousHalalas: 95000, newHalalas: 89000 },
          {
            cuttingStyleId: options.cuttingStyleId,
            previousHalalas: 1500,
            newHalalas: 0,
          },
        ]),
      );
      expect(await publicIds(`vendorId=${vendorId}`)).toEqual([]);
    });
  });

  describe('admin review', () => {
    it('queues a submitted product, then approves it (public) or rejects it with a reason', async () => {
      const { owner, admin, options, vendorId } = await setUp();
      const toApprove = await catalog.draft(owner, options);
      const toReject = await catalog.draft(owner, options);
      for (const id of [toApprove, toReject]) {
        await catalog.http
          .post(`/v1/vendor/products/${id}/submit`)
          .set(...bearer(owner))
          .expect(200);
      }

      const queue = await catalog.http
        .get(`/v1/admin/products?status=pending_review&vendorId=${vendorId}`)
        .set(...bearer(admin))
        .expect(200);
      const detail = await catalog.http
        .get(`/v1/admin/products/${toApprove}`)
        .set(...bearer(admin))
        .expect(200);
      const approved = await catalog.http
        .post(`/v1/admin/products/${toApprove}/approve`)
        .set(...bearer(admin))
        .expect(200);
      const rejected = await catalog.http
        .post(`/v1/admin/products/${toReject}/reject`)
        .set(...bearer(admin))
        .send({ reason: 'الصورة غير واضحة' })
        .expect(200);
      const twice = await catalog.http
        .post(`/v1/admin/products/${toApprove}/approve`)
        .set(...bearer(admin))
        .expect(409);
      const noReason = await catalog.http
        .post(`/v1/admin/products/${toReject}/reject`)
        .set(...bearer(admin))
        .send({})
        .expect(400);
      const unknown = await catalog.http
        .post(`/v1/admin/products/${randomUUID()}/approve`)
        .set(...bearer(admin))
        .expect(404);
      const vendorView = await catalog.http
        .get(`/v1/vendor/products/${toReject}`)
        .set(...bearer(owner))
        .expect(200);

      expect(
        (queue.body as Page<{ id: string }>).items
          .map((card) => card.id)
          .sort(),
      ).toEqual([toApprove, toReject].sort());
      expect((detail.body as ProductBody).status).toBe('pending_review');
      expect((approved.body as ProductBody).status).toBe('published');
      expect((rejected.body as ProductBody).status).toBe('rejected');
      expect(errorCode(twice.body)).toBe('PRODUCT_NOT_EDITABLE');
      expect(noReason.body).toMatchObject({ details: [{ field: 'reason' }] });
      expect(errorCode(unknown.body)).toBe('NOT_FOUND');
      expect((vendorView.body as ProductBody).rejectionReason).toBe(
        'الصورة غير واضحة',
      );
      expect(await publicIds(`vendorId=${vendorId}`)).toEqual([toApprove]);
      expect(
        (
          await prisma.auditLog.findMany({
            where: { entityId: { in: [toApprove, toReject] } },
          })
        )
          .map((entry) => entry.action)
          .sort(),
      ).toEqual(['catalog.product.approved', 'catalog.product.rejected']);
    });

    it('keeps the live product while a change request waits; a second edit replaces it; approval applies it', async () => {
      const { owner, admin, options, vendorId } = await setUp();
      const id = await catalog.published(owner, admin, options);
      const live = (
        await catalog.http
          .get(`/v1/vendor/products/${id}`)
          .set(...bearer(owner))
          .expect(200)
      ).body as ProductBody;
      const image = live.images[0].mediaId;
      const edit = (en: string, overrides: Record<string, unknown> = {}) =>
        catalog.http
          .put(`/v1/vendor/products/${id}`)
          .set(...bearer(owner))
          .send(
            catalog.body(options, [image], {
              fulfilment: undefined,
              name: { ar: en, en },
              sizes: [
                {
                  id: live.sizes[0].id,
                  approxWeightGrams: 8000,
                  priceHalalas: 95000,
                },
              ],
              ...overrides,
            }),
          );

      const first = await edit('First').expect(200);
      const second = await edit('Second').expect(200);
      const changedPrice = await edit('Third', {
        sizes: [
          { id: live.sizes[0].id, approxWeightGrams: 8000, priceHalalas: 1 },
        ],
      }).expect(400);
      const publicPage = await catalog.http
        .get(`/v1/public/products/${id}`)
        .expect(200);
      const queue = await catalog.http
        .get('/v1/admin/product-change-requests?limit=50')
        .set(...bearer(admin))
        .expect(200);
      const requestId = (second.body as ProductBody).changeRequest!.id;
      const approved = await catalog.http
        .post(`/v1/admin/product-change-requests/${requestId}/approve`)
        .set(...bearer(admin))
        .expect(200);
      const again = await catalog.http
        .post(`/v1/admin/product-change-requests/${requestId}/approve`)
        .set(...bearer(admin))
        .expect(404);

      expect((first.body as ProductBody).name.en).toBe('Naimi lamb');
      expect((first.body as ProductBody).changeRequest?.id).toBe(requestId);
      expect((second.body as ProductBody).changeRequest?.content.name.en).toBe(
        'Second',
      );
      expect(changedPrice.body).toMatchObject({
        details: [
          { field: 'sizes.0.priceHalalas', constraints: ['isLivePrice'] },
        ],
      });
      expect((publicPage.body as { name: { en: string } }).name.en).toBe(
        'Naimi lamb',
      );
      expect(
        (queue.body as Page<{ id: string; productId: string }>).items.filter(
          (request) => request.productId === id,
        ),
      ).toHaveLength(1);
      expect(approved.body).toMatchObject({
        status: 'published',
        name: { en: 'Second' },
      });
      expect(errorCode(again.body)).toBe('NOT_FOUND');
      expect(await publicIds(`vendorId=${vendorId}`)).toEqual([id]);
    });

    it('rejects a change request with a reason; the live product is unchanged', async () => {
      const { owner, admin, options } = await setUp();
      const id = await catalog.published(owner, admin, options);
      const live = (
        await catalog.http
          .get(`/v1/vendor/products/${id}`)
          .set(...bearer(owner))
          .expect(200)
      ).body as ProductBody;
      const edited = await catalog.http
        .put(`/v1/vendor/products/${id}`)
        .set(...bearer(owner))
        .send(
          catalog.body(options, [live.images[0].mediaId], {
            fulfilment: undefined,
            name: { ar: 'جديد', en: 'New' },
          }),
        )
        .expect(200);
      const requestId = (edited.body as ProductBody).changeRequest!.id;

      await catalog.http
        .post(`/v1/admin/product-change-requests/${requestId}/reject`)
        .set(...bearer(admin))
        .send({ reason: 'Keep the old name' })
        .expect(204);
      const after = await catalog.http
        .get(`/v1/vendor/products/${id}`)
        .set(...bearer(owner))
        .expect(200);
      const unknown = await catalog.http
        .post(`/v1/admin/product-change-requests/${randomUUID()}/reject`)
        .set(...bearer(admin))
        .send({ reason: 'r' })
        .expect(404);

      expect(after.body).toMatchObject({
        name: { en: 'Naimi lamb' },
        changeRequest: {
          status: 'rejected',
          rejectionReason: 'Keep the old name',
        },
      });
      expect(errorCode(unknown.body)).toBe('NOT_FOUND');
    });
  });

  describe("JAZLA's own products", () => {
    it('are created and published directly by an admin, and appear publicly', async () => {
      const admin = await vendors.admin();
      const options = await catalog.options(admin);
      const { vendor } = await app
        .get(CreatePlatformVendorUseCase, { strict: false })
        .execute();
      const image = await catalog.image(admin, 'admin');

      const created = await catalog.http
        .post('/v1/admin/products')
        .set(...bearer(admin))
        .send(catalog.body(options, [image]))
        .expect(201);
      const id = (created.body as ProductBody).id;
      catalog.rememberProduct(id);
      const published = await catalog.http
        .post(`/v1/admin/products/${id}/publish`)
        .set(...bearer(admin))
        .expect(200);
      const edited = await catalog.http
        .put(`/v1/admin/products/${id}`)
        .set(...bearer(admin))
        .send(
          catalog.body(options, [image], {
            fulfilment: undefined,
            name: { ar: 'نعيمي جزلة', en: 'JAZLA Naimi' },
            sizes: [
              {
                id: (published.body as ProductBody).sizes[0].id,
                approxWeightGrams: 8000,
                priceHalalas: 95000,
              },
            ],
          }),
        )
        .expect(200);
      const twice = await catalog.http
        .post(`/v1/admin/products/${id}/publish`)
        .set(...bearer(admin))
        .expect(409);
      const page = await catalog.http
        .get(`/v1/public/products/${id}`)
        .expect(200);

      expect(created.body).toMatchObject({
        vendorId: vendor.id,
        status: 'draft',
      });
      expect((published.body as ProductBody).status).toBe('published');
      expect(edited.body).toMatchObject({
        name: { en: 'JAZLA Naimi' },
        changeRequest: null,
      });
      expect(errorCode(twice.body)).toBe('PRODUCT_NOT_EDITABLE');
      expect(page.body).toMatchObject({
        id,
        vendor: { id: vendor.id, name: { en: 'JAZLA' } },
        name: { en: 'JAZLA Naimi' },
      });
      expect(
        (await prisma.auditLog.findMany({ where: { entityId: id } }))
          .map((entry) => entry.action)
          .sort(),
      ).toEqual(['catalog.product.published', 'catalog.product.updated']);
    });

    it("refuses an admin's write on a vendor's product as NOT_FOUND", async () => {
      const { owner, admin, options } = await setUp();
      const id = await catalog.draft(owner, options);

      const publish = await catalog.http
        .post(`/v1/admin/products/${id}/publish`)
        .set(...bearer(admin))
        .expect(404);
      const availability = await catalog.http
        .patch(`/v1/admin/products/${id}/availability`)
        .set(...bearer(admin))
        .send({ isAvailable: false })
        .expect(404);

      expect(errorCode(publish.body)).toBe('NOT_FOUND');
      expect(errorCode(availability.body)).toBe('NOT_FOUND');
    });
  });

  describe('public browsing', () => {
    it('shows a published product with its options, and the active categories', async () => {
      const { owner, admin, options } = await setUp();
      const id = await catalog.published(owner, admin, options);
      const inactive = await catalog.listItem(admin, 'categories');
      await catalog.http
        .patch(`/v1/admin/lists/categories/${inactive}`)
        .set(...bearer(admin))
        .send({ isActive: false })
        .expect(200);

      const page = await catalog.http
        .get(`/v1/public/products/${id}`)
        .expect(200);
      const categories = (
        (await catalog.http.get('/v1/public/categories').expect(200))
          .body as CategoryList
      ).items.map((item) => item.id);

      expect(page.body).toMatchObject({
        id,
        name: { ar: 'نعيمي', en: 'Naimi lamb' },
        category: { id: options.categoryId },
        meatType: { id: options.meatTypeId },
        fulfilment: 'both',
        minPriceHalalas: 95000,
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
        packagings: ['trays'],
        exclusions: [{ id: options.exclusionItemId }],
      });
      expect(categories).toContain(options.categoryId);
      expect(categories).not.toContain(inactive);
    });

    it('returns the public categories in the order admins set; other lists take no order', async () => {
      const admin = await vendors.admin();
      const [first, second, third] = [
        await catalog.listItem(admin, 'categories'),
        await catalog.listItem(admin, 'categories'),
        await catalog.listItem(admin, 'categories'),
      ];
      const order = (id: string, sortOrder: unknown) =>
        catalog.http
          .patch(`/v1/admin/lists/categories/${id}`)
          .set(...bearer(admin))
          .send({ sortOrder });
      // High numbers: the categories of tests running beside this one stay at 0.
      const moved = await order(first, 90003).expect(200);
      await order(second, 90001).expect(200);
      await order(third, 90002).expect(200);
      const created = await catalog.http
        .post('/v1/admin/lists/meat-types')
        .set(...bearer(admin))
        .send({ name: { ar: 'حاشي', en: 'Camel' }, sortOrder: 1 })
        .expect(400);
      const negative = await order(first, -1).expect(400);

      const listed = (
        (await catalog.http.get('/v1/public/categories').expect(200))
          .body as CategoryList
      ).items;
      const mine = listed.filter((item) =>
        [first, second, third].includes(item.id),
      );

      expect(moved.body).toMatchObject({ id: first, sortOrder: 90003 });
      expect(mine.map((item) => item.id)).toEqual([second, third, first]);
      expect(listed.indexOf(mine[0])).toBeGreaterThan(
        listed.findIndex((item) => item.sortOrder === 0),
      );
      expect(created.body).toMatchObject({
        code: 'VALIDATION_FAILED',
        details: [{ field: 'sortOrder', constraints: ['isOrderedList'] }],
      });
      expect(negative.body).toMatchObject({
        code: 'VALIDATION_FAILED',
        details: [{ field: 'sortOrder' }],
      });
    });

    it('hides an unpublished product', async () => {
      const { owner, options, vendorId } = await setUp();
      const draft = await catalog.draft(owner, options);
      const underReview = await catalog.draft(owner, options);
      await catalog.http
        .post(`/v1/vendor/products/${underReview}/submit`)
        .set(...bearer(owner))
        .expect(200);

      expect(await publicIds(`vendorId=${vendorId}`)).toEqual([]);
      for (const id of [draft, underReview]) {
        await catalog.http.get(`/v1/public/products/${id}`).expect(404);
      }
    });

    it('hides an unavailable product', async () => {
      const { owner, admin, options, vendorId } = await setUp();
      const id = await catalog.published(owner, admin, options);
      await catalog.http
        .patch(`/v1/vendor/products/${id}/availability`)
        .set(...bearer(owner))
        .send({ isAvailable: false })
        .expect(200);

      expect(await publicIds(`vendorId=${vendorId}`)).toEqual([]);
      await catalog.http.get(`/v1/public/products/${id}`).expect(404);
    });

    it("hides a suspended vendor's products", async () => {
      const { owner, admin, options, vendorId } = await setUp();
      const id = await catalog.published(owner, admin, options);
      await catalog.http
        .post(`/v1/admin/vendors/${vendorId}/suspend`)
        .set(...bearer(admin))
        .send({ reason: 'r' })
        .expect(200);

      expect(await publicIds(`vendorId=${vendorId}`)).toEqual([]);
      await catalog.http.get(`/v1/public/products/${id}`).expect(404);
    });

    it("hides an inactive category's products", async () => {
      const { owner, admin, options } = await setUp();
      const id = await catalog.published(owner, admin, options);
      await catalog.http
        .patch(`/v1/admin/lists/categories/${options.categoryId}`)
        .set(...bearer(admin))
        .send({ isActive: false })
        .expect(200);

      expect(await publicIds(`categoryId=${options.categoryId}`)).toEqual([]);
      await catalog.http.get(`/v1/public/products/${id}`).expect(404);
    });

    it('returns every item exactly once across pages, even with equal timestamps', async () => {
      const { owner, admin, options, vendorId } = await setUp();
      const ids: string[] = [];
      for (let n = 0; n < 5; n += 1) {
        ids.push(await catalog.published(owner, admin, options));
      }
      await prisma.product.updateMany({
        where: { id: { in: ids } },
        data: { createdAt: new Date('2026-11-16T09:00:00.000Z') },
      });

      const seen: string[] = [];
      let cursor: string | null = null;
      let pages = 0;
      do {
        const res = await catalog.http
          .get(
            `/v1/public/products?vendorId=${vendorId}&limit=2${cursor === null ? '' : `&cursor=${cursor}`}`,
          )
          .expect(200);
        const body = res.body as Page<Card>;
        seen.push(...body.items.map((card) => card.id));
        cursor = body.nextCursor;
        pages += 1;
      } while (cursor !== null);

      expect(pages).toBe(3);
      expect(seen).toHaveLength(5);
      expect([...seen].sort()).toEqual([...ids].sort());
      // Same timestamp: newest first falls back to the id, descending.
      expect(seen).toEqual([...ids].sort().reverse());
    });

    it('filters by category, vendor, meat type and price range', async () => {
      const a = await setUp('filter-a');
      const b = await setUp('filter-b');
      const cheap = await catalog.published(a.owner, a.admin, a.options, {
        sizes: [{ approxWeightGrams: 1000, priceHalalas: 10000 }],
      });
      const dear = await catalog.published(a.owner, a.admin, a.options, {
        meatTypeId: null,
        sizes: [{ approxWeightGrams: 1000, priceHalalas: 50000 }],
      });
      const other = await catalog.published(b.owner, b.admin, b.options);

      expect(
        (await publicIds(`categoryId=${a.options.categoryId}`)).sort(),
      ).toEqual([cheap, dear].sort());
      expect(await publicIds(`categoryId=${b.options.categoryId}`)).toEqual([
        other,
      ]);
      expect((await publicIds(`vendorId=${a.vendorId}`)).sort()).toEqual(
        [cheap, dear].sort(),
      );
      expect(await publicIds(`meatTypeId=${a.options.meatTypeId}`)).toEqual([
        cheap,
      ]);
      expect(
        await publicIds(`vendorId=${a.vendorId}&minPriceHalalas=10001`),
      ).toEqual([dear]);
      expect(
        await publicIds(`vendorId=${a.vendorId}&maxPriceHalalas=10000`),
      ).toEqual([cheap]);
      expect(
        await publicIds(
          `vendorId=${a.vendorId}&minPriceHalalas=10000&maxPriceHalalas=50000`,
        ),
      ).toHaveLength(2);
      const card = (
        await catalog.http
          .get(`/v1/public/products?vendorId=${b.vendorId}`)
          .expect(200)
      ).body as Page<Card>;
      expect(card.items[0]?.vendor).toMatchObject({ id: b.vendorId });
      expect(card.items[0]?.vendor.name).not.toBeNull();
    });

    it('refuses invalid filters, a foreign cursor and a malformed id', async () => {
      const badPrice = await catalog.http
        .get('/v1/public/products?minPriceHalalas=cheap')
        .expect(400);
      const badCategory = await catalog.http
        .get('/v1/public/products?categoryId=nope')
        .expect(400);
      const badCursor = await catalog.http
        .get('/v1/public/products?cursor=not-ours')
        .expect(400);
      const badId = await catalog.http
        .get('/v1/public/products/nope')
        .expect(400);
      const random = await catalog.http
        .get(`/v1/public/products/${randomUUID()}`)
        .expect(404);

      expect(badPrice.body).toMatchObject({
        details: [{ field: 'minPriceHalalas' }],
      });
      expect(badCategory.body).toMatchObject({
        details: [{ field: 'categoryId' }],
      });
      expect(badCursor.body).toMatchObject({ details: [{ field: 'cursor' }] });
      expect(badId.body).toMatchObject({ details: [{ field: 'id' }] });
      expect(errorCode(random.body)).toBe('NOT_FOUND');
    });
  });

  describe('writers to one product at the same moment', () => {
    /** Starts the request now (supertest sends on `then`). */
    const start = (test: Test): Promise<Response> => test.then((res) => res);

    const stored = async (id: string) => ({
      prices: (
        await prisma.productSize.findMany({
          where: { productId: id },
          orderBy: { position: 'asc' },
        })
      ).map((size) => size.priceHalalas),
      minPrice: (await prisma.product.findUnique({ where: { id } }))
        ?.minPriceHalalas,
    });

    const vendorProduct = async (owner: TestUser, id: string) =>
      (
        await catalog.http
          .get(`/v1/vendor/products/${id}`)
          .set(...bearer(owner))
          .expect(200)
      ).body as ProductBody;

    it('keeps the real lowest price after two price edits on different sizes', async () => {
      const { owner, admin, options } = await setUp();
      const id = await catalog.published(owner, admin, options, {
        sizes: [
          { approxWeightGrams: 4000, priceHalalas: 50000 },
          { approxWeightGrams: 8000, priceHalalas: 60000 },
        ],
      });
      const [small, large] = (await vendorProduct(owner, id)).sizes;
      const price = (sizeId: string, priceHalalas: number) =>
        start(
          catalog.http
            .patch(`/v1/vendor/products/${id}/prices`)
            .set(...bearer(owner))
            .send({ sizes: [{ sizeId, priceHalalas }] }),
        );

      // Both edits queue behind a lock on the product row, then go on together.
      const lock = await holdRowLock(prisma, 'products', id);
      const edits = [price(small.id, 70000), price(large.id, 65000)];
      try {
        await lock.waitForWaiters(2);
      } finally {
        await lock.release();
      }
      const responses = await Promise.all(edits);

      expect(responses.map((res) => res.status)).toEqual([200, 200]);
      // Each edit read the other's size before it committed: without the product lock
      // the stored lowest price is 60000 or 50000, from one edit's stale view.
      expect(await stored(id)).toEqual({
        prices: [70000, 65000],
        minPrice: 65000,
      });
    });

    it('keeps a price edit made between a change request and its approval', async () => {
      const { owner, admin, options } = await setUp();
      const id = await catalog.published(owner, admin, options);
      const live = await vendorProduct(owner, id);
      const requested = await catalog.http
        .put(`/v1/vendor/products/${id}`)
        .set(...bearer(owner))
        .send(
          catalog.body(options, [live.images[0].mediaId], {
            fulfilment: undefined,
            name: { ar: 'نعيمي بلدي', en: 'Local Naimi' },
            sizes: [
              {
                id: live.sizes[0].id,
                approxWeightGrams: 8000,
                priceHalalas: 95000,
              },
            ],
          }),
        )
        .expect(200);
      const requestId = (requested.body as ProductBody).changeRequest!.id;

      // The approval stops at its decision (the request row is locked); the price edit
      // starts while it waits.
      const lock = await holdRowLock(
        prisma,
        'product_change_requests',
        requestId,
      );
      const approval = start(
        catalog.http
          .post(`/v1/admin/product-change-requests/${requestId}/approve`)
          .set(...bearer(admin)),
      );
      let priceEdit: Promise<Response>;
      let priced = false;
      try {
        await lock.waitForWaiters(1);
        priceEdit = start(
          catalog.http
            .patch(`/v1/vendor/products/${id}/prices`)
            .set(...bearer(owner))
            .send({
              sizes: [{ sizeId: live.sizes[0].id, priceHalalas: 90000 }],
            }),
        ).then((res) => {
          priced = true;
          return res;
        });
        // With the product lock the price edit waits behind the approval; without it,
        // it commits now, before the approval writes.
        await lock.waitForWaiters(2, () => priced);
      } finally {
        await lock.release();
      }
      const approved = await approval;
      const priceResponse = await priceEdit;

      expect(approved.status).toBe(200);
      expect(priceResponse.status).toBe(200);
      expect(await stored(id)).toEqual({ prices: [90000], minPrice: 90000 });
      expect((await vendorProduct(owner, id)).name.en).toBe('Local Naimi');
    });
  });

  describe('authentication', () => {
    const id = randomUUID();
    it.each([
      ['post', '/v1/vendor/products'],
      ['get', '/v1/vendor/products'],
      ['get', `/v1/vendor/products/${id}`],
      ['put', `/v1/vendor/products/${id}`],
      ['post', `/v1/vendor/products/${id}/submit`],
      ['patch', `/v1/vendor/products/${id}/availability`],
      ['patch', `/v1/vendor/products/${id}/fulfilment`],
      ['patch', `/v1/vendor/products/${id}/prices`],
    ] as const)(
      '%s %s: 401 without a token, 403 with a customer token',
      async (method, path) => {
        const customer = await vendors.customer();

        const none = await catalog.http[method](path).expect(401);
        const wrong = await catalog.http[method](path)
          .set(...bearer(customer))
          .expect(403);

        expect(errorCode(none.body)).toBe('UNAUTHORIZED');
        expect(errorCode(wrong.body)).toBe('FORBIDDEN');
      },
    );

    it.each([
      ['post', '/v1/admin/lists/categories'],
      ['get', '/v1/admin/lists/categories'],
      ['patch', `/v1/admin/lists/categories/${id}`],
      ['post', '/v1/admin/cutting-packaging-incompatibilities'],
      ['get', '/v1/admin/cutting-packaging-incompatibilities'],
      ['delete', `/v1/admin/cutting-packaging-incompatibilities/${id}`],
      ['get', '/v1/admin/products'],
      ['get', `/v1/admin/products/${id}`],
      ['post', `/v1/admin/products/${id}/approve`],
      ['post', `/v1/admin/products/${id}/reject`],
      ['get', '/v1/admin/product-change-requests'],
      ['post', `/v1/admin/product-change-requests/${id}/approve`],
      ['post', `/v1/admin/product-change-requests/${id}/reject`],
      ['post', '/v1/admin/products'],
      ['put', `/v1/admin/products/${id}`],
      ['post', `/v1/admin/products/${id}/publish`],
      ['patch', `/v1/admin/products/${id}/availability`],
      ['patch', `/v1/admin/products/${id}/fulfilment`],
      ['patch', `/v1/admin/products/${id}/prices`],
    ] as const)(
      '%s %s: 401 without a token, 403 with a customer token',
      async (method, path) => {
        const customer = await vendors.customer();

        const none = await catalog.http[method](path).expect(401);
        const wrong = await catalog.http[method](path)
          .set(...bearer(customer))
          .expect(403);

        expect(errorCode(none.body)).toBe('UNAUTHORIZED');
        expect(errorCode(wrong.body)).toBe('FORBIDDEN');
      },
    );

    it('serves the public routes without a token', async () => {
      await catalog.http.get('/v1/public/categories').expect(200);
      await catalog.http.get('/v1/public/products').expect(200);
    });
  });
});

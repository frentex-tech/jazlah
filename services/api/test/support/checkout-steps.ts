import type request from 'supertest';
import type { CatalogJourney, CatalogOptions } from './catalog-journey';
import type { TestUser, VendorJourney } from './vendor-journey';

type Day = { date: string; isAvailable: boolean };

/** What placing an order answers: the order, as the apps read it. */
export type PlacedOrderBody = {
  order: {
    id: string;
    number: string;
    status: string;
    totalHalalas: number;
    subtotalHalalas: number;
    deliveryFeeHalalas: number;
    vatHalalas: number;
    vendor: { id: string };
    items: {
      productId: string;
      quantity: number;
      unitPriceHalalas: number;
      totalHalalas: number;
      name: { ar: string; en: string };
      packaging: string | null;
      cutting: { name: { en: string } } | null;
      exclusions: { name: { en: string } }[];
    }[];
    history: { from: string | null; to: string; actorType: string }[];
  };
};

/**
 * The steps that lead to a placed cash-on-delivery pickup order, through the real
 * endpoints: a named customer, a cart line, the first available day, `POST
 * /v1/customer/orders`. The same steps as place-order.e2e-spec.ts takes, for the suites
 * that need an order made by the API rather than saved into the tables.
 */
export class CheckoutSteps {
  private keys = 0;

  constructor(
    private readonly vendors: VendorJourney,
    private readonly catalog: CatalogJourney,
  ) {}

  private bearer(user: TestUser): [string, string] {
    return ['Authorization', `Bearer ${user.accessToken}`];
  }

  /** A new customer with a full name, signed in. */
  async namedCustomer(label: string): Promise<TestUser> {
    const user = await this.vendors.customer(label);
    await this.catalog.http
      .patch('/v1/customer/profile')
      .set(...this.bearer(user))
      .send({ fullName: 'عبدالله الحربي' })
      .expect(200);
    return user;
  }

  /** Puts one line of the product in the customer's cart; returns the size ordered. */
  async addToCart(
    user: TestUser,
    productId: string,
    options: CatalogOptions,
    quantity: number,
  ): Promise<string> {
    const product = await this.catalog.http
      .get(`/v1/public/products/${productId}`)
      .expect(200);
    const sizeId = (product.body as { sizes: { id: string }[] }).sizes[0]?.id;
    expect(sizeId).toBeDefined();
    await this.catalog.http
      .post('/v1/customer/cart/items')
      .set(...this.bearer(user))
      .send({
        productId,
        sizeId,
        cuttingStyleId: options.cuttingStyleId,
        packaging: 'trays',
        exclusionItemIds: [options.exclusionItemId],
        quantity,
      })
      .expect(200);
    return sizeId ?? '';
  }

  /** Chooses pickup on the first day the days route says is available. */
  async choosePickupDay(user: TestUser): Promise<string> {
    const res = await this.catalog.http
      .get('/v1/customer/checkout/days?method=pickup')
      .set(...this.bearer(user))
      .expect(200);
    const day = (res.body as { items: Day[] }).items.find(
      (item) => item.isAvailable,
    );
    expect(day).toBeDefined();
    await this.catalog.http
      .patch('/v1/customer/cart/fulfilment')
      .set(...this.bearer(user))
      .send({ method: 'pickup', date: day?.date })
      .expect(200);
    return day?.date ?? '';
  }

  /** Places the cart as a cash-on-delivery order under a fresh idempotency key. */
  place(user: TestUser): request.Test {
    this.keys += 1;
    return this.catalog.http
      .post('/v1/customer/orders')
      .set(...this.bearer(user))
      .set(
        'Idempotency-Key',
        `00000000-0000-4000-8000-${String(Date.now() % 1e6).padStart(6, '0')}${String(this.keys).padStart(6, '0')}`,
      )
      .send({ paymentMethod: 'cod' });
  }
}

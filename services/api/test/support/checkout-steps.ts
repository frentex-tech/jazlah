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
    fulfilment: string;
    fulfilmentDate: string;
    paymentMethod: string;
    totalHalalas: number;
    subtotalHalalas: number;
    deliveryFeeHalalas: number;
    vatHalalas: number;
    notes: string | null;
    window: { start: string; end: string } | null;
    address: { label: string; city: string | null } | null;
    pickupPoint: { name: { en: string }; phone: string | null } | null;
    vendor: { id: string; name: { en: string } };
    customer: { id: string; name: string | null; phone: string };
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
  payment: unknown;
};

/**
 * The steps that lead to a placed order through the real endpoints: a named customer, a
 * cart line, an available pickup or delivery day, and `POST /v1/customer/orders`. Used
 * by suites that need an order made by the API rather than saved into the tables.
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

  /** Chooses the first or last available day for pickup or delivery. */
  async chooseFulfilment(
    user: TestUser,
    method: 'delivery' | 'pickup',
    which: 'first' | 'last' = 'first',
    addressId?: string,
    deliveryLocation?: { latitude: number; longitude: number },
  ): Promise<string> {
    const res = await this.catalog.http
      .get(`/v1/customer/checkout/days?method=${method}`)
      .set(...this.bearer(user))
      .expect(200);
    const available = (res.body as { items: Day[] }).items.filter(
      (item) => item.isAvailable,
    );
    const day = which === 'first' ? available[0] : available.at(-1);
    expect(day).toBeDefined();

    const fulfilment =
      method === 'delivery'
        ? {
            method,
            addressId:
              addressId ?? (await this.addressOf(user, deliveryLocation)),
            date: day?.date,
          }
        : { method, date: day?.date };
    await this.catalog.http
      .patch('/v1/customer/cart/fulfilment')
      .set(...this.bearer(user))
      .send(fulfilment)
      .expect(200);
    return day?.date ?? '';
  }

  /** Chooses pickup on the first day the days route says is available. */
  choosePickupDay(user: TestUser): Promise<string> {
    return this.chooseFulfilment(user, 'pickup');
  }

  /** Places an order; by default, cash on delivery under a fresh idempotency key. */
  place(
    user: TestUser,
    key?: string | null,
    body: object = { paymentMethod: 'cod' },
  ): request.Test {
    this.keys += 1;
    const idempotencyKey =
      key === undefined
        ? `00000000-0000-4000-8000-${String(Date.now() % 1e6).padStart(6, '0')}${String(this.keys).padStart(6, '0')}`
        : key;
    const call = this.catalog.http
      .post('/v1/customer/orders')
      .set(...this.bearer(user));
    return (
      idempotencyKey === null
        ? call
        : call.set('Idempotency-Key', idempotencyKey)
    ).send(body);
  }

  private async addressOf(
    user: TestUser,
    location: { latitude: number; longitude: number } | undefined,
  ): Promise<string> {
    if (location === undefined) {
      throw new Error('A delivery location is required to create an address.');
    }
    const res = await this.catalog.http
      .post('/v1/customer/addresses')
      .set(...this.bearer(user))
      .send({ label: 'البيت', location, city: 'الرياض' })
      .expect(201);
    return (res.body as { id: string }).id;
  }
}

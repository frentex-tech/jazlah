import { Money } from '@common/money/money';
import { ErrorCode } from '@common/errors/error-code.enum';
import { InMemoryOrderRepository } from '../domain/fakes/in-memory-order.repository.fake';
import type { NewOrder } from '../domain/new-order.type';
import { FindCustomerOrderUseCase } from './find-customer-order.use-case';

const REQUEST: NewOrder = {
  userId: 'user-1',
  customer: { name: 'Abdullah', phone: '+966500000001' },
  vendorId: 'vendor-1',
  vendor: {
    name: { ar: 'م', en: 'S' },
    phone: null,
    location: null,
    city: null,
  },
  commissionBasisPoints: 1250,
  orderType: 'ready_meat',
  lines: [
    {
      productId: 'p1',
      sizeId: 's1',
      quantity: 1,
      unitPrice: Money.of(97_000),
      packaging: null,
      notes: null,
      imageUrl: null,
      names: {
        name: { ar: 'نعيمي', en: 'Naimi' },
        size: { id: 's1', approxWeightGrams: 8000, tag: null },
        cutting: null,
        exclusions: [],
      },
    },
  ],
  fulfilment: 'pickup',
  fulfilmentDate: '2026-11-28',
  window: null,
  address: null,
  pickupPoint: {
    name: { ar: 'م', en: 'S' },
    address: null,
    location: null,
    phone: null,
    hours: null,
  },
  deliveryFee: Money.zero(),
  paymentMethod: 'cod',
  notes: null,
  carcasses: 0,
};

async function codeOf(work: Promise<unknown>): Promise<unknown> {
  return work.then(
    () => 'resolved',
    (error: unknown) => (error as { code?: unknown }).code,
  );
}

async function setUp() {
  const orders = new InMemoryOrderRepository();
  const saved = await orders.create({
    number: 'JZ-261126-0001',
    request: REQUEST,
    pricing: {
      subtotal: Money.of(97_000),
      discount: Money.zero(),
      deliveryFee: Money.zero(),
      total: Money.of(97_000),
      vat: Money.of(12_652),
    },
    status: 'new',
    firstEntry: {
      from: null,
      to: 'new',
      actorType: 'customer',
      actorId: 'user-1',
      note: null,
      at: new Date('2026-11-26T10:00:00Z'),
    },
  });
  return { saved, useCase: new FindCustomerOrderUseCase(orders) };
}

describe('FindCustomerOrderUseCase', () => {
  it('answers the order of the customer', async () => {
    const { saved, useCase } = await setUp();

    expect((await useCase.execute('user-1', saved.id)).number).toBe(
      'JZ-261126-0001',
    );
  });

  it('answers NOT_FOUND for the order of another customer, as for a missing one', async () => {
    const { saved, useCase } = await setUp();

    expect(await codeOf(useCase.execute('user-2', saved.id))).toBe(
      ErrorCode.NOT_FOUND,
    );
    expect(await codeOf(useCase.execute('user-1', 'unknown'))).toBe(
      ErrorCode.NOT_FOUND,
    );
  });
});

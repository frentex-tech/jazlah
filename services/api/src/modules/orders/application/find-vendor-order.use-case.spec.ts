import { ErrorCode } from '@common/errors/error-code.enum';
import { InMemoryOrderRepository } from '../domain/fakes/in-memory-order.repository.fake';
import { placeTestOrder } from '../domain/fakes/place-test-order.fake';
import { FindVendorOrderUseCase } from './find-vendor-order.use-case';

async function codeOf(work: Promise<unknown>): Promise<unknown> {
  return work.then(
    () => 'resolved',
    (error: unknown) => (error as { code?: unknown }).code,
  );
}

async function setUp() {
  const orders = new InMemoryOrderRepository();
  const saved = await placeTestOrder(orders, {
    number: 'JZ-1',
    at: new Date('2026-11-26T10:00:00Z'),
  });
  return { saved, useCase: new FindVendorOrderUseCase(orders) };
}

describe('FindVendorOrderUseCase', () => {
  it('answers the order of the store', async () => {
    const { saved, useCase } = await setUp();

    expect((await useCase.execute('vendor-1', saved.id)).number).toBe('JZ-1');
  });

  it('answers NOT_FOUND for the order of another store, as for a missing one', async () => {
    const { saved, useCase } = await setUp();

    expect(await codeOf(useCase.execute('vendor-2', saved.id))).toBe(
      ErrorCode.NOT_FOUND,
    );
    expect(await codeOf(useCase.execute('vendor-1', 'unknown'))).toBe(
      ErrorCode.NOT_FOUND,
    );
  });
});

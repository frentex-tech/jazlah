import { ErrorCode } from '@common/errors/error-code.enum';
import { InMemoryOrderRepository } from '../domain/fakes/in-memory-order.repository.fake';
import { placeTestOrder } from '../domain/fakes/place-test-order.fake';
import { FindAdminOrderUseCase } from './find-admin-order.use-case';

async function codeOf(work: Promise<unknown>): Promise<unknown> {
  return work.then(
    () => 'resolved',
    (error: unknown) => (error as { code?: unknown }).code,
  );
}

describe('FindAdminOrderUseCase', () => {
  it('answers any order, and NOT_FOUND for an unknown one', async () => {
    const orders = new InMemoryOrderRepository();
    const saved = await placeTestOrder(orders, {
      number: 'JZ-1',
      vendorId: 'vendor-9',
      userId: 'user-9',
      at: new Date('2026-11-26T10:00:00Z'),
    });
    const useCase = new FindAdminOrderUseCase(orders);

    expect((await useCase.execute(saved.id)).number).toBe('JZ-1');
    expect(await codeOf(useCase.execute('unknown'))).toBe(ErrorCode.NOT_FOUND);
  });
});

import type { DbContext } from '@infra/database/db-context';
import { ErrorCode } from '@common/errors/error-code.enum';
import {
  CUSTOMER,
  OTHER_CUSTOMER,
  buildCustomersKit,
} from './customers-test-kit.fake';

/** The services on in-memory fakes. */
const kitWithFakes = () =>
  buildCustomersKit((client) => ({ client }) as unknown as DbContext);

async function codeOf(work: Promise<unknown>): Promise<unknown> {
  return work.then(
    () => 'resolved',
    (error: unknown) => (error as { code?: unknown }).code,
  );
}

describe('MarketingConsentsService', () => {
  it('is not granted while the customer never chose (opt-in)', async () => {
    const kit = kitWithFakes();

    expect(await kit.consents.currentOf(CUSTOMER)).toEqual({
      granted: false,
      changedAt: null,
    });
  });

  it('keeps every change: grant, withdraw, grant leaves three records in order, the last current', async () => {
    const kit = kitWithFakes();

    await kit.consents.set(CUSTOMER, true);
    await kit.consents.set(CUSTOMER, false);
    const current = await kit.consents.set(CUSTOMER, true);

    expect(
      kit.client.consents.map(({ granted, sequence, source, kind }) => ({
        granted,
        sequence,
        source,
        kind,
      })),
    ).toEqual([
      { granted: true, sequence: 1, source: 'customer', kind: 'marketing' },
      { granted: false, sequence: 2, source: 'customer', kind: 'marketing' },
      { granted: true, sequence: 3, source: 'customer', kind: 'marketing' },
    ]);
    expect(current).toEqual({
      granted: true,
      changedAt: kit.client.consents[2]?.createdAt,
    });
    expect(kit.accounts.locked).toEqual([CUSTOMER, CUSTOMER, CUSTOMER]);
  });

  it('records nothing when the choice does not change', async () => {
    const kit = kitWithFakes();

    await kit.consents.set(CUSTOMER, false);
    await kit.consents.set(CUSTOMER, true);
    await kit.consents.set(CUSTOMER, true);

    expect(kit.client.consents.map((row) => row.granted)).toEqual([true]);
  });

  it("numbers each customer's history on its own", async () => {
    const kit = kitWithFakes();

    await kit.consents.set(CUSTOMER, true);
    await kit.consents.set(OTHER_CUSTOMER, true);

    expect(kit.client.consents.map((row) => row.sequence)).toEqual([1, 1]);
  });

  it('refuses a deleted account with UNAUTHORIZED, recording nothing', async () => {
    const kit = kitWithFakes();
    kit.accounts.delete(CUSTOMER);

    expect(await codeOf(kit.consents.set(CUSTOMER, true))).toBe(
      ErrorCode.UNAUTHORIZED,
    );
    expect(kit.client.consents).toEqual([]);
  });

  describe('withdrawForDeletion', () => {
    it('ends a granted history with a withdrawal from the deletion', async () => {
      const kit = kitWithFakes();
      await kit.consents.set(CUSTOMER, true);

      await kit.consents.withdrawForDeletion(CUSTOMER);

      expect(kit.client.consents.at(-1)).toMatchObject({
        granted: false,
        sequence: 2,
        source: 'account_deletion',
      });
      expect((await kit.consents.currentOf(CUSTOMER)).granted).toBe(false);
    });

    it('records nothing when consent was not granted', async () => {
      const kit = kitWithFakes();
      await kit.consents.set(CUSTOMER, true);
      await kit.consents.set(CUSTOMER, false);

      await kit.consents.withdrawForDeletion(CUSTOMER);

      expect(kit.client.consents).toHaveLength(2);
    });
  });
});

import type { DbContext } from '@infra/database/db-context';
import { ErrorCode } from '@common/errors/error-code.enum';
import { CUSTOMER_LIMITS } from './customer-limits.constants';
import {
  CUSTOMER,
  OTHER_CUSTOMER,
  buildCustomersKit,
} from './customers-test-kit.fake';

/** The services on in-memory fakes. */
const kitWithFakes = () =>
  buildCustomersKit((client) => ({ client }) as unknown as DbContext);
import type { NewCustomerAddress } from './new-customer-address.type';

type Kit = ReturnType<typeof kitWithFakes>;

async function codeOf(work: Promise<unknown>): Promise<unknown> {
  return work.then(
    () => 'resolved',
    (error: unknown) => (error as { code?: unknown }).code,
  );
}

function address(
  label: string,
  overrides: Partial<NewCustomerAddress> = {},
): NewCustomerAddress {
  return {
    label,
    location: { latitude: 24.7136, longitude: 46.6753 },
    city: 'الرياض',
    district: null,
    street: null,
    building: null,
    shortNationalAddress: 'RRRD2929',
    driverInstructions: null,
    makeDefault: false,
    ...overrides,
  };
}

/** Labels of the customer's addresses, as listed, with the default marked `*`. */
async function listed(kit: Kit, userId = CUSTOMER): Promise<string[]> {
  return (await kit.addresses.list(userId)).map(
    (each) => `${each.label}${each.isDefault ? '*' : ''}`,
  );
}

describe('CustomerAddressesService', () => {
  it('makes the first address the default, and a later one not, after locking the user', async () => {
    const kit = kitWithFakes();

    const home = await kit.addresses.create(CUSTOMER, address('Home'));
    await kit.addresses.create(CUSTOMER, address('Work'));

    expect(home).toMatchObject({
      label: 'Home',
      location: { latitude: 24.7136, longitude: 46.6753 },
      city: 'الرياض',
      shortNationalAddress: 'RRRD2929',
      isDefault: true,
    });
    expect(await listed(kit)).toEqual(['Home*', 'Work']);
    expect(kit.accounts.locked).toEqual([CUSTOMER, CUSTOMER]);
  });

  it('says whether each address is covered, on every read', async () => {
    const kit = kitWithFakes();
    const home = await kit.addresses.create(CUSTOMER, address('Home'));
    await kit.addresses.create(
      CUSTOMER,
      address('Jeddah', { location: { latitude: 21.54, longitude: 39.17 } }),
    );

    expect(home.isCovered).toBe(true);
    expect(
      (await kit.addresses.list(CUSTOMER)).map(
        (each) => `${each.label}:${each.isCovered}`,
      ),
    ).toEqual(['Home:true', 'Jeddah:false']);
  });

  it('moves the default to a new address created with makeDefault', async () => {
    const kit = kitWithFakes();
    await kit.addresses.create(CUSTOMER, address('Home'));

    await kit.addresses.create(
      CUSTOMER,
      address('Work', { makeDefault: true }),
    );

    expect(await listed(kit)).toEqual(['Work*', 'Home']);
  });

  it(`refuses address ${CUSTOMER_LIMITS.addresses + 1} with ADDRESS_LIMIT_REACHED, adding nothing`, async () => {
    const kit = kitWithFakes();
    for (let n = 1; n <= CUSTOMER_LIMITS.addresses; n += 1) {
      await kit.addresses.create(CUSTOMER, address(`Address ${n}`));
    }

    const refused = kit.addresses.create(CUSTOMER, address('One too many'));

    await expect(refused).rejects.toMatchObject({
      code: ErrorCode.ADDRESS_LIMIT_REACHED,
      details: { limit: CUSTOMER_LIMITS.addresses },
    });
    expect(kit.client.addresses).toHaveLength(CUSTOMER_LIMITS.addresses);
  });

  it("counts each customer's addresses on their own", async () => {
    const kit = kitWithFakes();
    for (let n = 1; n <= CUSTOMER_LIMITS.addresses; n += 1) {
      await kit.addresses.create(OTHER_CUSTOMER, address(`Address ${n}`));
    }

    const home = await kit.addresses.create(CUSTOMER, address('Home'));

    expect(home.isDefault).toBe(true);
  });

  it('makes another address the default, clearing the old one', async () => {
    const kit = kitWithFakes();
    await kit.addresses.create(CUSTOMER, address('Home'));
    const work = await kit.addresses.create(CUSTOMER, address('Work'));

    const made = await kit.addresses.makeDefault(CUSTOMER, work.id);

    expect(made.isDefault).toBe(true);
    expect(await listed(kit)).toEqual(['Work*', 'Home']);
  });

  it('leaves the default as it is when it is made the default again', async () => {
    const kit = kitWithFakes();
    const home = await kit.addresses.create(CUSTOMER, address('Home'));

    await kit.addresses.makeDefault(CUSTOMER, home.id);

    expect(await listed(kit)).toEqual(['Home*']);
  });

  it('promotes the newest remaining address when the default is deleted', async () => {
    const kit = kitWithFakes();
    const home = await kit.addresses.create(CUSTOMER, address('Home'));
    await kit.addresses.create(CUSTOMER, address('Work'));
    await kit.addresses.create(CUSTOMER, address('Parents'));

    await kit.addresses.remove(CUSTOMER, home.id);

    expect(await listed(kit)).toEqual(['Parents*', 'Work']);
  });

  it('keeps the default when another address is deleted, and leaves none after the last', async () => {
    const kit = kitWithFakes();
    const home = await kit.addresses.create(CUSTOMER, address('Home'));
    const work = await kit.addresses.create(CUSTOMER, address('Work'));

    await kit.addresses.remove(CUSTOMER, work.id);
    expect(await listed(kit)).toEqual(['Home*']);

    await kit.addresses.remove(CUSTOMER, home.id);
    expect(await listed(kit)).toEqual([]);
  });

  it('changes only the fields given; null clears a readable field; the default stays', async () => {
    const kit = kitWithFakes();
    const home = await kit.addresses.create(CUSTOMER, address('Home'));

    const changed = await kit.addresses.update(CUSTOMER, home.id, {
      label: 'Villa',
      location: { latitude: 21.4858, longitude: 39.1925 },
      city: null,
      driverInstructions: 'Ring twice',
    });

    expect(changed).toMatchObject({
      label: 'Villa',
      location: { latitude: 21.4858, longitude: 39.1925 },
      city: null,
      shortNationalAddress: 'RRRD2929',
      driverInstructions: 'Ring twice',
      isDefault: true,
    });
  });

  it.each([
    ['get', (kit: Kit, id: string) => kit.addresses.get(CUSTOMER, id)],
    [
      'update',
      (kit: Kit, id: string) =>
        kit.addresses.update(CUSTOMER, id, { label: 'Mine now' }),
    ],
    [
      'makeDefault',
      (kit: Kit, id: string) => kit.addresses.makeDefault(CUSTOMER, id),
    ],
    ['remove', (kit: Kit, id: string) => kit.addresses.remove(CUSTOMER, id)],
  ])(
    "answers %s on another customer's address with NOT_FOUND, changing nothing",
    async (_name, act) => {
      const kit = kitWithFakes();
      const theirs = await kit.addresses.create(
        OTHER_CUSTOMER,
        address('Theirs'),
      );

      expect(await codeOf(act(kit, theirs.id))).toBe(ErrorCode.NOT_FOUND);
      expect(await listed(kit, OTHER_CUSTOMER)).toEqual(['Theirs*']);
    },
  );

  it('refuses a deleted account with UNAUTHORIZED and a disabled one with ACCOUNT_DISABLED', async () => {
    const kit = kitWithFakes();
    kit.accounts.delete(CUSTOMER);
    kit.accounts.disable(OTHER_CUSTOMER);

    expect(await codeOf(kit.addresses.create(CUSTOMER, address('Home')))).toBe(
      ErrorCode.UNAUTHORIZED,
    );
    expect(await codeOf(kit.addresses.list(CUSTOMER))).toBe(
      ErrorCode.UNAUTHORIZED,
    );
    expect(
      await codeOf(kit.addresses.create(OTHER_CUSTOMER, address('Home'))),
    ).toBe(ErrorCode.ACCOUNT_DISABLED);
    expect(kit.client.addresses).toEqual([]);
  });

  it('erases every address of the customer and no one else', async () => {
    const kit = kitWithFakes();
    await kit.addresses.create(CUSTOMER, address('Home'));
    await kit.addresses.create(CUSTOMER, address('Work'));
    await kit.addresses.create(OTHER_CUSTOMER, address('Theirs'));

    await kit.addresses.eraseOf(CUSTOMER);

    expect(await listed(kit)).toEqual([]);
    expect(await listed(kit, OTHER_CUSTOMER)).toEqual(['Theirs*']);
  });
});

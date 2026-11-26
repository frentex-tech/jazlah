import type { INestApplication } from '@nestjs/common';
import type { App } from 'supertest/types';
import { AppError } from '@common/errors/app-error';
import { PrismaService } from '@infra/database/prisma.service';
import { TransactionRunner } from '@infra/database/transaction-runner';
import { SMS_PORTS } from '@integrations/sms';
import { FakeSmsProvider } from '@integrations/sms/testing';
import { STORAGE_PORT } from '@integrations/storage';
import { FakeStorageProvider } from '@integrations/storage/testing';
import { CapacityService } from '@modules/scheduling';
import { createHttpApp } from './support/create-http-app';
import { VendorJourney } from './support/vendor-journey';

/**
 * `CapacityService` against the database (SCH-API-2): taking the last place of a day is
 * atomic. The day rows belong to this suite's own vendor, so no other suite sees them.
 */
describe('Capacity (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let vendors: VendorJourney;
  let capacity: CapacityService;
  let transactions: TransactionRunner;
  let vendorId: string;

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
    capacity = app.get(CapacityService);
    transactions = app.get(TransactionRunner);
    vendors = new VendorJourney(app, sms, storage);
    vendorId = (await vendors.approvedVendor('capacity-vendor')).vendorId;
  });

  afterAll(async () => {
    if (app === undefined) {
      return;
    }
    // The day rows go with the vendor (cascade).
    await vendors.cleanUp();
    await app.close();
  });

  /** A day with its own limit of `ordersLimit` orders and `carcassesLimit` carcasses, nothing booked. */
  async function dayWithLimit(
    date: string,
    ordersLimit: number,
    carcassesLimit = 10,
  ): Promise<void> {
    await prisma.dayCapacity.create({
      data: {
        vendorId,
        date: new Date(`${date}T00:00:00Z`),
        ordersLimit,
        carcassesLimit,
      },
    });
  }

  const reserve = (date: string, carcasses = 0) =>
    transactions.run(() => capacity.reserve({ vendorId, date, carcasses }));

  const outcome = (promise: Promise<void>): Promise<string> =>
    promise.then(
      () => 'reserved',
      (error: unknown) => (error instanceof AppError ? error.code : 'other'),
    );

  const booked = async (date: string) =>
    (
      await prisma.dayCapacity.findUniqueOrThrow({
        where: {
          vendorId_date: { vendorId, date: new Date(`${date}T00:00:00Z`) },
        },
      })
    ).ordersBooked;

  it('gives the last place to one of two reservations at once; the other is DAY_FULL', async () => {
    await dayWithLimit('2031-01-01', 1);

    const results = await Promise.all([
      outcome(reserve('2031-01-01')),
      outcome(reserve('2031-01-01')),
    ]);

    expect(results.sort()).toEqual(['DAY_FULL', 'reserved']);
    expect(await booked('2031-01-01')).toBe(1);
  });

  it('takes places up to the limit exactly, then refuses, and a release frees one', async () => {
    await dayWithLimit('2031-01-02', 2);

    expect(await outcome(reserve('2031-01-02'))).toBe('reserved');
    expect(await outcome(reserve('2031-01-02'))).toBe('reserved');
    expect(await outcome(reserve('2031-01-02'))).toBe('DAY_FULL');
    expect(await booked('2031-01-02')).toBe(2);

    await transactions.run(() =>
      capacity.release({ vendorId, date: '2031-01-02', carcasses: 0 }),
    );
    expect(await booked('2031-01-02')).toBe(1);
    expect(await outcome(reserve('2031-01-02'))).toBe('reserved');
  });

  it('refuses an order whose carcasses would pass the day’s carcass limit', async () => {
    await dayWithLimit('2031-01-03', 10, 2);

    expect(await outcome(reserve('2031-01-03', 3))).toBe('DAY_FULL');
    expect(await outcome(reserve('2031-01-03', 2))).toBe('reserved');
  });

  it('makes the day row on the first reservation of a day without one', async () => {
    expect(await outcome(reserve('2031-01-04'))).toBe('reserved');
    expect(await booked('2031-01-04')).toBe(1);
  });

  it('shows the bookings to the days computation', async () => {
    await dayWithLimit('2031-01-05', 3);
    await reserve('2031-01-05');

    const bookings = await capacity.bookingsOf(
      vendorId,
      '2031-01-05',
      '2031-01-06',
    );

    expect([...bookings.entries()]).toEqual([
      ['2031-01-05', { ordersBooked: 1, ordersLimit: 3 }],
    ]);
  });
});

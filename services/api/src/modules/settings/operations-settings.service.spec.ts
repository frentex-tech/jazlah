import type { Clock } from '@common/time/clock.port';
import type { AuditLogWriter } from '@infra/audit/audit-log-writer';
import type { DbContext } from '@infra/database/db-context';
import type { TransactionRunner } from '@infra/database/transaction-runner';
import { OperationsSettingsService } from './operations-settings.service';

type OperationsSettingsRow = {
  id: string;
  singleton: boolean;
  deliveryWindowStart: string;
  deliveryWindowEnd: string;
  cutoffs: unknown;
  defaultOrdersPerDay: number;
  defaultCarcassesPerDay: number;
  codEnabled: boolean;
  codMaxOrderHalalas: number | null;
  codAllowedOrderTypes: string[];
  codConfirmation: string;
  bookingHorizonDays: number;
  minOrderHalalas: number;
  deliveryFeeHalalas: number;
  complaintWindowHours: number;
  closedDays: unknown;
  isPaused: boolean;
  pauseMessageAr: string | null;
  pauseMessageEn: string | null;
  createdAt: Date;
  updatedAt: Date;
};

const SETTINGS_ROW: OperationsSettingsRow = {
  id: '00000000-0000-4000-8000-000000000001',
  singleton: true,
  deliveryWindowStart: '16:00',
  deliveryWindowEnd: '22:00',
  cutoffs: {
    readyMeat: { time: '12:00', leadDays: 0 },
    carcass: { time: '20:00', leadDays: 1 },
    cooked: { time: '18:00', leadDays: 1 },
    occasion: { time: null, leadDays: 3 },
    adha: { time: null, leadDays: 3 },
  },
  defaultOrdersPerDay: 40,
  defaultCarcassesPerDay: 10,
  codEnabled: true,
  codMaxOrderHalalas: null,
  codAllowedOrderTypes: ['ready_meat'],
  codConfirmation: 'review',
  bookingHorizonDays: 14,
  minOrderHalalas: 0,
  deliveryFeeHalalas: 0,
  complaintWindowHours: 48,
  closedDays: [],
  isPaused: false,
  pauseMessageAr: null,
  pauseMessageEn: null,
  createdAt: new Date('2026-11-28T00:00:00.000Z'),
  updatedAt: new Date('2026-11-28T00:00:00.000Z'),
};

describe('OperationsSettingsService', () => {
  it('uses a fresh selector for every parallel read', async () => {
    const selectors: { singleton: boolean }[] = [];
    const findUnique = jest.fn(
      ({ where }: { where: { singleton: boolean } }) => {
        selectors.push(where);
        return Promise.resolve(SETTINGS_ROW);
      },
    );
    const db = {
      get client() {
        return { operationsSettings: { findUnique } };
      },
    } as unknown as DbContext;
    const transactions: Pick<TransactionRunner, 'run'> = {
      run: async <T>(work: () => Promise<T>) => work(),
    };
    const audit = {} as unknown as AuditLogWriter;
    const clock: Clock = { now: () => new Date('2026-11-28T00:00:00.000Z') };
    const service = new OperationsSettingsService(
      db,
      transactions,
      audit,
      clock,
    );

    const reads = await Promise.all(
      Array.from({ length: 100 }, () => service.current()),
    );

    expect(reads).toHaveLength(100);
    expect(findUnique).toHaveBeenCalledTimes(100);
    expect(new Set(selectors).size).toBe(100);
  });
});

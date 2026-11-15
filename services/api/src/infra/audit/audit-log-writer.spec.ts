import type { DbContext } from '../database/db-context';
import { AuditLogWriter } from './audit-log-writer';

const VENDOR_ID = '7f3a2c1e-0b9d-4e5f-8a6b-1c2d3e4f5a6b';

describe('AuditLogWriter', () => {
  function setup() {
    const created: unknown[] = [];
    const client = {
      auditLog: {
        create: (args: unknown) => {
          created.push(args);
          return Promise.resolve({});
        },
      },
    };
    return {
      writer: new AuditLogWriter({ client } as unknown as DbContext),
      created,
    };
  }

  it('writes the entry, with empty metadata by default', async () => {
    const { writer, created } = setup();

    await writer.write({
      actorId: null,
      action: 'vendors.vendor.created',
      entity: 'vendor',
      entityId: VENDOR_ID,
    });

    expect(created).toEqual([
      {
        data: {
          actorId: null,
          action: 'vendors.vendor.created',
          entity: 'vendor',
          entityId: VENDOR_ID,
          metadata: {},
        },
      },
    ]);
  });

  it('keeps the metadata it is given', async () => {
    const { writer, created } = setup();

    await writer.write({
      actorId: VENDOR_ID,
      action: 'vendors.vendor.commission_changed',
      entity: 'vendor',
      entityId: VENDOR_ID,
      metadata: { commissionBasisPoints: 1250, previous: null },
    });

    expect(created).toMatchObject([
      { data: { metadata: { commissionBasisPoints: 1250, previous: null } } },
    ]);
  });
});

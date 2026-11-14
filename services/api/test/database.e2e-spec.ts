import { randomUUID } from 'node:crypto';
import type { INestApplication } from '@nestjs/common';
import { Logger } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppConfigModule } from '@config/app-config.module';
import { databaseConfig } from '@config/database.config';
import type { DatabaseConfig } from '@config/database-config.type';
import { AppError } from '@common/errors/app-error';
import { ErrorCode } from '@common/errors/error-code.enum';
import { DatabaseModule } from '@infra/database/database.module';
import { DbContext } from '@infra/database/db-context';
import { IdempotencyOutsideTransactionError } from '@infra/database/idempotency-outside-transaction.error';
import { IdempotencyRunner } from '@infra/database/idempotency-runner';
import { Prisma } from '@infra/database/generated/prisma/client';
import { mapPrismaError } from '@infra/database/map-prisma-error';
import { PrismaService } from '@infra/database/prisma.service';
import { runAfterCommit } from '@infra/database/run-after-commit';
import { runInTransaction } from '@infra/database/run-in-transaction';
import { TransactionAbortedError } from '@infra/database/transaction-aborted.error';
import { TransactionRunner } from '@infra/database/transaction-runner';

describe('Database (e2e, test database)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let db: DbContext;
  let transactions: TransactionRunner;
  let idempotency: IdempotencyRunner;
  const created: string[] = [];
  /** The idempotency tests' operation; its keys are removed after each test. */
  const onceOperation = `e2e-once-${randomUUID()}`;
  /** Rows of the write-conflict tests are created under this entity and removed by it. */
  const conflictEntity = `e2e-conflict-${randomUUID()}`;

  /** A new audit entry; its id is recorded so the test removes it afterwards. */
  function newEntry(metadata: Prisma.InputJsonObject = {}) {
    const id = randomUUID();
    created.push(id);
    return {
      id,
      action: 'e2e.probe.created',
      entity: 'probe',
      entityId: randomUUID(),
      metadata: { source: 'database.e2e-spec', ...metadata },
    };
  }

  async function persisted(...ids: string[]): Promise<number> {
    return prisma.auditLog.count({ where: { id: { in: ids } } });
  }

  async function caught(work: () => Promise<unknown>): Promise<unknown> {
    try {
      await work();
    } catch (error) {
      return error;
    }
    throw new Error('expected the work to throw');
  }

  /** What a repository does: query through DbContext, map known errors. */
  async function repositoryCall<T>(query: () => Promise<T>): Promise<T> {
    try {
      return await query();
    } catch (error) {
      mapPrismaError(error);
    }
  }

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppConfigModule, DatabaseModule],
    }).compile();
    app = moduleRef.createNestApplication();
    await app.init();
    prisma = app.get(PrismaService);
    db = app.get(DbContext);
    transactions = app.get(TransactionRunner);
    idempotency = app.get(IdempotencyRunner);
  });

  afterEach(async () => {
    await prisma.auditLog.deleteMany({ where: { id: { in: created } } });
    await prisma.auditLog.deleteMany({ where: { entity: conflictEntity } });
    await prisma.idempotencyKey.deleteMany({
      where: { operation: onceOperation },
    });
    created.length = 0;
    jest.restoreAllMocks();
  });

  afterAll(async () => {
    await app.close();
  });

  it('writes and reads an audit entry', async () => {
    const entry = newEntry();
    await db.client.auditLog.create({ data: entry });

    const found = await db.client.auditLog.findUnique({
      where: { id: entry.id },
    });

    expect(found).toMatchObject({ ...entry, actorId: null });
    expect(found?.createdAt).toBeInstanceOf(Date);
  });

  describe('mapping real database errors', () => {
    it('maps a duplicate on a unique column to CONFLICT with the field', async () => {
      const entry = newEntry();
      await db.client.auditLog.create({ data: entry });

      const error = await caught(() =>
        repositoryCall(() => db.client.auditLog.create({ data: entry })),
      );

      expect(error).toBeInstanceOf(AppError);
      expect(error).toMatchObject({
        code: ErrorCode.CONFLICT,
        details: { constraint: 'audit_logs_pkey', fields: ['id'] },
      });
    });

    it('maps an update of a missing row to NOT_FOUND', async () => {
      const error = await caught(() =>
        repositoryCall(() =>
          db.client.auditLog.update({
            where: { id: randomUUID() },
            data: { action: 'e2e.probe.updated' },
          }),
        ),
      );
      expect(error).toMatchObject({ code: ErrorCode.NOT_FOUND });
    });

    it('maps a malformed UUID (P2007) to BAD_REQUEST', async () => {
      const error = await caught(() =>
        repositoryCall(() =>
          db.client.auditLog.findUnique({ where: { id: 'not-a-uuid' } }),
        ),
      );
      expect(error).toMatchObject({
        code: ErrorCode.BAD_REQUEST,
        cause: { code: 'P2007' },
      });
    });

    it('maps a unique violation in raw SQL (P2010) to CONFLICT like P2002', async () => {
      const entry = newEntry();
      await db.client.auditLog.create({ data: entry });
      const error = await caught(() =>
        repositoryCall(
          () =>
            db.client
              .$executeRaw`INSERT INTO audit_logs (id, action, entity, entity_id) VALUES (${entry.id}::uuid, 'x', 'probe', ${entry.entityId}::uuid)`,
        ),
      );
      expect(error).toMatchObject({
        code: ErrorCode.CONFLICT,
        details: { constraint: 'audit_logs_pkey', fields: ['id'] },
        cause: { code: 'P2010' },
      });
    });

    it('maps a value too long in raw SQL to BAD_REQUEST and a check violation to CONFLICT', async () => {
      // Temporary tables live in the transaction's connection and go with its rollback.
      const tooLong = await caught(() =>
        transactions.run(async () => {
          await db.client
            .$executeRaw`CREATE TEMP TABLE e2e_codes (code varchar(3)) ON COMMIT DROP`;
          await db.client
            .$executeRaw`INSERT INTO e2e_codes (code) VALUES ('ABCDE')`;
        }),
      );
      expect(tooLong).toMatchObject({ code: ErrorCode.BAD_REQUEST });

      const check = await caught(() =>
        transactions.run(async () => {
          await db.client
            .$executeRaw`CREATE TEMP TABLE e2e_phones (phone text CONSTRAINT e2e_phones_short CHECK (length(phone) < 5)) ON COMMIT DROP`;
          await db.client
            .$executeRaw`INSERT INTO e2e_phones (phone) VALUES ('+966500000001')`;
        }),
      );
      expect(check).toMatchObject({
        code: ErrorCode.CONFLICT,
        details: { constraint: 'e2e_phones_short' },
      });
    });

    it('maps a transaction that runs past its timeout (P2028) to SERVICE_UNAVAILABLE', async () => {
      const error = await caught(() =>
        transactions.run(
          async () => {
            await db.client.$executeRaw`SELECT pg_sleep(0.5)`;
          },
          { timeout: 200 },
        ),
      );
      expect(error).toMatchObject({
        code: ErrorCode.SERVICE_UNAVAILABLE,
        status: 503,
      });
    });

    it('maps an unreachable database to SERVICE_UNAVAILABLE', async () => {
      const config = app.get<DatabaseConfig>(databaseConfig.KEY);
      // Nothing listens on port 1: the connection is refused at once.
      const unreachable = new PrismaService({
        ...config,
        url: 'postgresql://e2e:e2e@127.0.0.1:1/e2e',
      });
      try {
        const error = await caught(() =>
          runInTransaction(unreachable, () => Promise.resolve()),
        );
        expect(error).toMatchObject({
          code: ErrorCode.SERVICE_UNAVAILABLE,
          cause: { code: 'P1001' },
        });
      } finally {
        await unreachable.$disconnect();
      }
    });
  });

  describe('transactions', () => {
    it('leaves no row behind when a transaction throws', async () => {
      const first = newEntry();
      const second = newEntry();

      const error = await caught(() =>
        transactions.run(async () => {
          await db.client.auditLog.create({ data: first });
          await db.client.auditLog.create({ data: second });
          throw new Error('rolled back on purpose');
        }),
      );

      expect(error).toBeInstanceOf(Error);
      expect(await persisted(first.id, second.id)).toBe(0);
    });

    it('commits every write of a transaction that succeeds, nested calls included', async () => {
      const first = newEntry();
      const second = newEntry();

      await transactions.run(async () => {
        await db.client.auditLog.create({ data: first });
        await transactions.run(() =>
          db.client.auditLog.create({ data: second }),
        );
      });

      expect(await persisted(first.id, second.id)).toBe(2);
    });

    it('rolls back a nested call’s write with the outer transaction (it joined)', async () => {
      const outer = newEntry();
      const inner = newEntry();

      await caught(() =>
        transactions.run(async () => {
          await db.client.auditLog.create({ data: outer });
          await transactions.run(() =>
            db.client.auditLog.create({ data: inner }),
          );
          throw new Error('outer fails after the nested call returned');
        }),
      );

      // Had the nested call opened a transaction of its own, `inner` would be committed.
      expect(await persisted(outer.id, inner.id)).toBe(0);
    });

    it('joins when given the root client inside a transaction, and rolls back with it', async () => {
      const outer = newEntry();
      const viaRoot = newEntry();
      const viaContext = newEntry();

      await caught(() =>
        transactions.run(async () => {
          await db.client.auditLog.create({ data: outer });
          // The root client (PrismaService) passed explicitly, as the review's repro did.
          await runInTransaction(prisma, () =>
            db.client.auditLog.create({ data: viaRoot }),
          );
          // A repository method called inside the transaction, with no client passed.
          await repositoryCall(() =>
            db.client.auditLog.create({ data: viaContext }),
          );
          throw new Error('outer fails');
        }),
      );

      expect(await persisted(outer.id, viaRoot.id, viaContext.id)).toBe(0);
    });

    it('refuses to commit after a caught database error: rejects, saves nothing, runs no callback', async () => {
      const first = newEntry();
      const callbacks: string[] = [];

      const error = await caught(() =>
        transactions.run(async () => {
          await db.client.auditLog.create({ data: first });
          runAfterCommit(() => callbacks.push('event'));
          try {
            await repositoryCall(() =>
              db.client.auditLog.create({ data: first }),
            );
          } catch (conflict) {
            callbacks.push(`caught ${(conflict as AppError).code}`);
          }
          return 'ok';
        }),
      );

      expect(error).toBeInstanceOf(TransactionAbortedError);
      expect((error as TransactionAbortedError).cause).toMatchObject({
        code: 'P2002',
      });
      expect(callbacks).toEqual(['caught CONFLICT']);
      expect(await persisted(first.id)).toBe(0);
      process.stdout.write(
        `poisoned transaction: rejected with ${(error as Error).name}; callbacks run: ${JSON.stringify(callbacks)}; rows persisted: ${await persisted(first.id)}\n`,
      );
    });
  });

  describe('runOnce (idempotency keys)', () => {
    it('does the work once for one key and returns the same result on the repeat', async () => {
      let executions = 0;
      const once = () =>
        transactions.run(() =>
          idempotency.runOnce(onceOperation, 'event-1', async () => {
            executions += 1;
            const entry = newEntry();
            await db.client.auditLog.create({ data: entry });
            return { auditLogId: entry.id, execution: executions };
          }),
        );

      const first = await once();
      const second = await once();

      expect(executions).toBe(1);
      expect(second).toEqual(first);
      expect(await persisted(first.auditLogId)).toBe(1);
    });

    it('lets two concurrent runs with one key execute the work once', async () => {
      let executions = 0;
      const run = (caller: string) =>
        transactions.run(() =>
          idempotency.runOnce(onceOperation, 'event-concurrent', async () => {
            executions += 1;
            // Hold the claim while the other caller arrives and waits on it.
            await new Promise((resolve) => setTimeout(resolve, 200));
            return { executedBy: caller };
          }),
        );

      const [a, b] = await Promise.all([run('caller-a'), run('caller-b')]);

      process.stdout.write(
        `two concurrent runOnce calls with one key: executions=${executions}, results ${JSON.stringify([a, b])}
`,
      );
      expect(executions).toBe(1);
      expect(a).toEqual(b);
      expect(
        await prisma.idempotencyKey.count({
          where: { operation: onceOperation, key: 'event-concurrent' },
        }),
      ).toBe(1);
    });

    it('leaves no key behind when the work throws, so a retry does the work', async () => {
      const failure = new Error('provider timed out');
      await expect(
        transactions.run(() =>
          idempotency.runOnce(onceOperation, 'event-retry', () =>
            Promise.reject(failure),
          ),
        ),
      ).rejects.toBe(failure);
      expect(
        await prisma.idempotencyKey.count({
          where: { operation: onceOperation, key: 'event-retry' },
        }),
      ).toBe(0);

      const retried = await transactions.run(() =>
        idempotency.runOnce(onceOperation, 'event-retry', () =>
          Promise.resolve('done'),
        ),
      );
      expect(retried).toBe('done');
    });

    it('leaves no key behind when the caller catches the error and commits', async () => {
      await transactions.run(async () => {
        await idempotency
          .runOnce(onceOperation, 'event-caught', () =>
            Promise.reject(new Error('not a database error')),
          )
          .catch(() => undefined);
      });
      expect(
        await prisma.idempotencyKey.count({
          where: { operation: onceOperation, key: 'event-caught' },
        }),
      ).toBe(0);
    });

    it('refuses to run outside a transaction', async () => {
      await expect(
        idempotency.runOnce(onceOperation, 'event-outside', () =>
          Promise.resolve('never'),
        ),
      ).rejects.toBeInstanceOf(IdempotencyOutsideTransactionError);
    });
  });

  describe('write conflicts (serializable isolation)', () => {
    const serializable = {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    };

    function conflictRow() {
      return {
        action: 'e2e.conflict',
        entity: conflictEntity,
        entityId: randomUUID(),
      };
    }

    /**
     * A transaction of its own (straight on PrismaService, not through the helper, so it
     * does not join) that reads and writes the same rows as the test's transaction and
     * commits first. The test's transaction then fails with a serialization failure.
     */
    async function commitConflictingWrite(): Promise<void> {
      await prisma.$transaction(async (tx) => {
        await tx.auditLog.count({ where: { entity: conflictEntity } });
        await tx.auditLog.create({ data: conflictRow() });
      }, serializable);
    }

    async function conflictingTransaction(
      conflictOn: (attempt: number) => boolean,
    ) {
      let attempts = 0;
      const result = await caught(async () => {
        await transactions.run(async () => {
          attempts += 1;
          await db.client.auditLog.count({ where: { entity: conflictEntity } });
          if (conflictOn(attempts)) {
            await commitConflictingWrite();
          }
          await db.client.auditLog.create({ data: conflictRow() });
        }, serializable);
        throw new Error('committed');
      });
      return { attempts, result };
    }

    beforeEach(() => {
      jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => undefined);
    });

    it('retries a serialization failure and commits on a later attempt', async () => {
      const { attempts, result } = await conflictingTransaction(
        (attempt) => attempt === 1,
      );
      expect(result).toMatchObject({ message: 'committed' });
      expect(attempts).toBe(2);
    });

    it('gives up after the last attempt with TRANSACTION_CONFLICT', async () => {
      const { attempts, result } = await conflictingTransaction(() => true);
      expect(result).toBeInstanceOf(AppError);
      expect(result).toMatchObject({
        code: ErrorCode.TRANSACTION_CONFLICT,
        status: 409,
      });
      expect(attempts).toBe(3);
      process.stdout.write(
        `forced write conflict: ${attempts} attempts, then ${(result as AppError).code}; first cause ${JSON.stringify((result as AppError).cause instanceof Error ? ((result as AppError).cause as { code?: string }).code : undefined)}\n`,
      );
    });
  });
});

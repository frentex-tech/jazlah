import { Logger } from '@nestjs/common';
import { AppError } from '@common/errors/app-error';
import { ErrorCode } from '@common/errors/error-code.enum';
import { TRANSACTION_MAX_ATTEMPTS } from './database.constants';
import { Prisma } from './generated/prisma/client';
import type { PrismaService } from './prisma.service';
import { runAfterCommit } from './run-after-commit';
import { runInTransaction } from './run-in-transaction';
import { TransactionAbortedError } from './transaction-aborted.error';
import type { TransactionOptions } from './transaction-options.type';
import { transactionScopeStorage } from './transaction-scope.storage';

/**
 * A fake PrismaService whose tracked client's `$transaction` runs the work with a fake
 * transaction client and, like Prisma, rejects when the work rejects (rolled back).
 * Records each transaction it opens and the options it was given.
 */
function fakePrisma() {
  const opened: { tx: Prisma.TransactionClient; options: unknown }[] = [];
  const $transaction = (
    work: (tx: Prisma.TransactionClient) => Promise<unknown>,
    options: unknown,
  ): Promise<unknown> => {
    const tx = {} as Prisma.TransactionClient;
    opened.push({ tx, options });
    return work(tx);
  };
  const prisma = {
    trackedClient: { $transaction },
  } as unknown as PrismaService;
  return { prisma, opened };
}

function writeConflict(): Prisma.PrismaClientKnownRequestError {
  return new Prisma.PrismaClientKnownRequestError(
    'Transaction failed due to a write conflict or a deadlock',
    { code: 'P2034', clientVersion: 'test' },
  );
}

describe('runInTransaction', () => {
  beforeEach(() => {
    jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => undefined);
  });

  afterEach(() => jest.restoreAllMocks());

  it('opens one transaction, runs the work in its scope and returns the result', async () => {
    const { prisma, opened } = fakePrisma();
    const result = await runInTransaction(prisma, () => {
      expect(transactionScopeStorage.getStore()?.client).toBe(opened[0].tx);
      return Promise.resolve(42);
    });

    expect(result).toBe(42);
    expect(opened).toHaveLength(1);
    expect(transactionScopeStorage.getStore()).toBeUndefined();
  });

  it('passes the options to Prisma', async () => {
    const { prisma, opened } = fakePrisma();
    const options: TransactionOptions = {
      timeout: 1_000,
      maxWait: 500,
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    };
    await runInTransaction(prisma, () => Promise.resolve(), options);
    expect(opened[0].options).toEqual(options);
  });

  it('joins the open transaction, whatever client it is given', async () => {
    const outer = fakePrisma();
    const other = fakePrisma();
    await runInTransaction(outer.prisma, () =>
      runInTransaction(other.prisma, () => {
        expect(transactionScopeStorage.getStore()?.client).toBe(
          outer.opened[0].tx,
        );
        return Promise.resolve();
      }),
    );

    expect(outer.opened).toHaveLength(1);
    expect(other.opened).toHaveLength(0);
  });

  it('rethrows what the work throws', async () => {
    const { prisma } = fakePrisma();
    await expect(
      runInTransaction(prisma, () => Promise.reject(new Error('rolled back'))),
    ).rejects.toThrow('rolled back');
  });

  it('maps a Prisma error that escapes the work', async () => {
    const { prisma } = fakePrisma();
    const timeout = new Prisma.PrismaClientKnownRequestError('expired', {
      code: 'P2028',
      clientVersion: 'test',
    });
    await expect(
      runInTransaction(prisma, () => Promise.reject(timeout)),
    ).rejects.toMatchObject({ code: ErrorCode.SERVICE_UNAVAILABLE });
  });

  describe('when a query in the scope failed', () => {
    it('refuses to commit when the work caught the error and returned', async () => {
      const { prisma } = fakePrisma();
      const queryError = new Error('duplicate key');
      const ran: string[] = [];
      const result = runInTransaction(prisma, () => {
        runAfterCommit(() => ran.push('event'));
        // What trackQueryFailures does when a query fails inside the scope.
        const scope = transactionScopeStorage.getStore();
        if (scope) {
          scope.failure = { error: queryError };
        }
        return Promise.resolve('caught and carried on');
      });

      await expect(result).rejects.toBeInstanceOf(TransactionAbortedError);
      await expect(result).rejects.toMatchObject({ cause: queryError });
      expect(ran).toEqual([]);
    });
  });

  describe('write conflicts', () => {
    it('runs the transaction again after a write conflict and returns the result', async () => {
      const { prisma, opened } = fakePrisma();
      let attempts = 0;
      const result = await runInTransaction(prisma, () => {
        attempts += 1;
        return attempts === 1
          ? Promise.reject(writeConflict())
          : Promise.resolve('second time');
      });

      expect(result).toBe('second time');
      expect(attempts).toBe(2);
      expect(opened).toHaveLength(2);
    });

    it('gives up after the last attempt with TRANSACTION_CONFLICT', async () => {
      const { prisma } = fakePrisma();
      let attempts = 0;
      const result = runInTransaction(prisma, () => {
        attempts += 1;
        return Promise.reject(writeConflict());
      });

      await expect(result).rejects.toBeInstanceOf(AppError);
      await expect(result).rejects.toMatchObject({
        code: ErrorCode.TRANSACTION_CONFLICT,
        status: 409,
      });
      expect(attempts).toBe(TRANSACTION_MAX_ATTEMPTS);
    });

    it('recognises a conflict that a repository already mapped or a caught one', async () => {
      const { prisma } = fakePrisma();
      let attempts = 0;
      await runInTransaction(prisma, () => {
        attempts += 1;
        if (attempts === 1) {
          return Promise.reject(
            new AppError(ErrorCode.TRANSACTION_CONFLICT, {
              cause: writeConflict(),
            }),
          );
        }
        if (attempts === 2) {
          const scope = transactionScopeStorage.getStore();
          if (scope) {
            scope.failure = { error: writeConflict() };
          }
        }
        return Promise.resolve();
      });

      expect(attempts).toBe(3);
    });

    it('drops the after-commit callbacks of a failed attempt', async () => {
      const { prisma } = fakePrisma();
      const ran: string[] = [];
      let attempts = 0;
      await runInTransaction(prisma, () => {
        attempts += 1;
        runAfterCommit(() => ran.push(`attempt ${attempts}`));
        return attempts === 1
          ? Promise.reject(writeConflict())
          : Promise.resolve();
      });

      expect(ran).toEqual(['attempt 2']);
    });

    it('does not retry any other error', async () => {
      const { prisma } = fakePrisma();
      let attempts = 0;
      await expect(
        runInTransaction(prisma, () => {
          attempts += 1;
          return Promise.reject(new Error('not a conflict'));
        }),
      ).rejects.toThrow('not a conflict');
      expect(attempts).toBe(1);
    });

    it('leaves retrying to the outermost call when it joins', async () => {
      const { prisma, opened } = fakePrisma();
      let innerAttempts = 0;
      await runInTransaction(prisma, async () => {
        await runInTransaction(prisma, () => {
          innerAttempts += 1;
          return innerAttempts === 1
            ? Promise.reject(writeConflict())
            : Promise.resolve();
        });
      });

      expect(innerAttempts).toBe(2);
      expect(opened).toHaveLength(2);
    });
  });

  describe('with runAfterCommit', () => {
    it('runs a callback immediately outside a transaction', () => {
      const ran: string[] = [];
      runAfterCommit(() => ran.push('now'));
      expect(ran).toEqual(['now']);
    });

    it('runs callbacks after the commit, in order', async () => {
      const { prisma } = fakePrisma();
      const order: string[] = [];
      await runInTransaction(prisma, async () => {
        runAfterCommit(() => order.push('first callback'));
        await Promise.resolve();
        runAfterCommit(() => order.push('second callback'));
        order.push('work done');
      });
      order.push('returned');

      expect(order).toEqual([
        'work done',
        'first callback',
        'second callback',
        'returned',
      ]);
    });

    it('discards callbacks when the transaction rolls back', async () => {
      const { prisma } = fakePrisma();
      const ran: string[] = [];
      await expect(
        runInTransaction(prisma, () => {
          runAfterCommit(() => ran.push('callback'));
          return Promise.reject(new Error('rolled back'));
        }),
      ).rejects.toThrow('rolled back');

      expect(ran).toEqual([]);
    });

    it('holds a nested call’s callbacks until the outermost commit', async () => {
      const { prisma } = fakePrisma();
      const order: string[] = [];
      await runInTransaction(prisma, async () => {
        await runInTransaction(prisma, () => {
          runAfterCommit(() => order.push('callback'));
          return Promise.resolve();
        });
        order.push('inner returned');
      });

      expect(order).toEqual(['inner returned', 'callback']);
    });

    it('logs a failing callback and still runs the others and returns the result', async () => {
      const error = jest
        .spyOn(Logger.prototype, 'error')
        .mockImplementation(() => undefined);
      const { prisma } = fakePrisma();
      const ran: string[] = [];
      const result = await runInTransaction(prisma, () => {
        runAfterCommit(() => {
          throw new Error('callback failed');
        });
        runAfterCommit(() => ran.push('second'));
        return Promise.resolve('committed');
      });

      expect(result).toBe('committed');
      expect(ran).toEqual(['second']);
      expect(error).toHaveBeenCalledTimes(1);
    });

    it('logs a callback whose promise rejects and still runs the others', async () => {
      const error = jest
        .spyOn(Logger.prototype, 'error')
        .mockImplementation(() => undefined);
      const { prisma } = fakePrisma();
      const ran: string[] = [];
      await runInTransaction(prisma, () => {
        runAfterCommit(() =>
          Promise.reject(new Error('async callback failed')),
        );
        runAfterCommit(() => ran.push('second'));
        return Promise.resolve();
      });
      await new Promise((resolve) => setImmediate(resolve));

      expect(ran).toEqual(['second']);
      expect(error).toHaveBeenCalledTimes(1);
      expect(error.mock.calls[0]?.[0]).toMatchObject({
        err: { message: 'async callback failed' },
      });
    });

    it('isolates callbacks outside a transaction too: a throw or a rejection is logged, never thrown', async () => {
      const error = jest
        .spyOn(Logger.prototype, 'error')
        .mockImplementation(() => undefined);
      const ran: string[] = [];
      expect(() =>
        runAfterCommit(() => {
          throw new Error('sync failure');
        }),
      ).not.toThrow();
      runAfterCommit(() => Promise.reject(new Error('async failure')));
      runAfterCommit(() => ran.push('third'));
      await new Promise((resolve) => setImmediate(resolve));

      expect(ran).toEqual(['third']);
      expect(error).toHaveBeenCalledTimes(2);
    });

    it('runs at once a callback registered after the transaction committed', async () => {
      const { prisma } = fakePrisma();
      const ran: string[] = [];
      let resume!: () => void;
      let lateRegistration!: Promise<void>;
      await runInTransaction(prisma, () => {
        // Work started inside the transaction that outlives it keeps its async context.
        lateRegistration = new Promise<void>((resolve) => {
          resume = resolve;
        }).then(() => {
          expect(transactionScopeStorage.getStore()?.state).toBe('committed');
          runAfterCommit(() => ran.push('late callback'));
          ran.push('registered');
        });
        return Promise.resolve();
      });
      resume();
      await lateRegistration;

      expect(ran).toEqual(['late callback', 'registered']);
    });

    it('drops, with a warning, a callback registered after the transaction rolled back', async () => {
      const warn = jest
        .spyOn(Logger.prototype, 'warn')
        .mockImplementation(() => undefined);
      const { prisma } = fakePrisma();
      const ran: string[] = [];
      let resume!: () => void;
      let lateRegistration!: Promise<void>;
      await expect(
        runInTransaction(prisma, () => {
          lateRegistration = new Promise<void>((resolve) => {
            resume = resolve;
          }).then(() => {
            runAfterCommit(() => ran.push('late callback'));
          });
          return Promise.reject(new Error('rolled back'));
        }),
      ).rejects.toThrow('rolled back');
      resume();
      await lateRegistration;

      expect(ran).toEqual([]);
      expect(warn).toHaveBeenCalledWith(
        'An after-commit callback was registered after its transaction rolled back; it is dropped',
      );
    });
  });
});

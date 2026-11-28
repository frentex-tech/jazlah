import type { PrismaService } from '@infra/database/prisma.service';

/** A row lock held by a test from a connection of its own; `holdRowLock`. */
export type HeldRowLock = Readonly<{
  /**
   * Resolves once `count` backends wait behind this lock, directly or behind another
   * waiter, or once `orWhen()` is true (polled).
   */
  waitForWaiters(count: number, orWhen?: () => boolean): Promise<void>;
  /** Ends the lock's transaction, letting the waiters go on. */
  release(): Promise<void>;
}>;

/** The tables whose rows a test can lock. */
export type LockableTable =
  | 'products'
  | 'product_change_requests'
  | 'users'
  | 'auth_sessions'
  | 'carts'
  | 'orders';

const WAIT_LIMIT_MS = 10_000;
const POLL_MS = 10;
/** Longer than any wait of a test, shorter than Jest's timeout. */
const HOLD_LIMIT_MS = 20_000;

/**
 * Locks a row (`SELECT … FOR UPDATE`) in a transaction of its own, so an e2e test can
 * stop concurrent requests at a known point and then let them go on together: the
 * deterministic way to make two writes overlap. Requests queue behind the lock if they
 * lock or update that row; `waitForWaiters` polls `pg_stat_activity`, since PostgreSQL
 * signals no event when a backend starts waiting. Always `release()` (in `finally`).
 */
export async function holdRowLock(
  prisma: PrismaService,
  table: LockableTable,
  id: string,
): Promise<HeldRowLock> {
  let release!: () => void;
  const released = new Promise<void>((resolve) => {
    release = resolve;
  });
  let locked!: (pid: number) => void;
  const holderPid = new Promise<number>((resolve) => {
    locked = resolve;
  });

  const transaction = prisma.$transaction(
    async (tx) => {
      const rows =
        table === 'products'
          ? await tx.$queryRaw<{ pid: number }[]>`
              SELECT pg_backend_pid() AS pid FROM "products"
              WHERE "id" = ${id}::uuid FOR UPDATE`
          : table === 'users'
            ? await tx.$queryRaw<{ pid: number }[]>`
              SELECT pg_backend_pid() AS pid FROM "users"
              WHERE "id" = ${id}::uuid FOR UPDATE`
            : table === 'carts'
              ? await tx.$queryRaw<{ pid: number }[]>`
              SELECT pg_backend_pid() AS pid FROM "carts"
              WHERE "id" = ${id}::uuid FOR UPDATE`
              : table === 'auth_sessions'
                ? await tx.$queryRaw<{ pid: number }[]>`
              SELECT pg_backend_pid() AS pid FROM "auth_sessions"
              WHERE "id" = ${id}::uuid FOR UPDATE`
                : table === 'orders'
                  ? await tx.$queryRaw<{ pid: number }[]>`
              SELECT pg_backend_pid() AS pid FROM "orders"
              WHERE "id" = ${id}::uuid FOR UPDATE`
                  : await tx.$queryRaw<{ pid: number }[]>`
              SELECT pg_backend_pid() AS pid FROM "product_change_requests"
              WHERE "id" = ${id}::uuid FOR UPDATE`;
      const row = rows[0];
      if (row === undefined) {
        throw new Error(`No ${table} row ${id} to lock`);
      }
      locked(row.pid);
      await released;
    },
    { timeout: HOLD_LIMIT_MS },
  );
  const pid = await Promise.race([
    holderPid,
    transaction.then(() => {
      throw new Error('The row lock ended before it was taken');
    }),
  ]);

  return {
    async waitForWaiters(count, orWhen = () => false) {
      const deadline = Date.now() + WAIT_LIMIT_MS;
      for (;;) {
        const [row] = await prisma.$queryRaw<{ waiting: number }[]>`
          WITH RECURSIVE "waiters" ("pid") AS (
            SELECT "pid" FROM pg_stat_activity
            WHERE ${pid}::int = ANY (pg_blocking_pids("pid"))
            UNION
            SELECT a."pid" FROM pg_stat_activity a
            JOIN "waiters" w ON w."pid" = ANY (pg_blocking_pids(a."pid"))
          )
          SELECT count(*)::int AS "waiting" FROM "waiters"`;
        if ((row?.waiting ?? 0) >= count || orWhen()) {
          return;
        }
        if (Date.now() > deadline) {
          throw new Error(
            `Expected ${count} waiters behind the row lock within ${WAIT_LIMIT_MS} ms, saw ${row?.waiting ?? 0}`,
          );
        }
        await new Promise((resolve) => setTimeout(resolve, POLL_MS));
      }
    },
    async release() {
      release();
      await transaction;
    },
  };
}

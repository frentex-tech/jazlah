type Row = Record<string, unknown>;
type Where = Readonly<Record<string, unknown>>;

/**
 * The part of the database client MediaService uses (`client.media`), in memory, for
 * its unit tests: rows are plain objects, and the `where` filters understand equality
 * and `{ lt: Date }`, which is all the service sends. Excluded from the build
 * (`*.fake.ts`). Unit tests never need a database (.claude/rules/database.md, 19).
 *
 * Use it as `{ client: fake } as unknown as DbContext`.
 */
export class InMemoryMediaClient {
  readonly rows = new Map<string, Row>();
  readonly media = {
    create: (args: { data: Row }): Promise<Row> => {
      const now = new Date();
      const row: Row = {
        status: 'pending',
        sizeBytes: null,
        detectedContentType: null,
        originalFileName: null,
        ownerId: null,
        rejectionReason: null,
        confirmedAt: null,
        createdAt: now,
        updatedAt: now,
        ...args.data,
      };
      this.rows.set(String(row.id), row);
      return Promise.resolve({ ...row });
    },
    findUnique: (args: { where: { id: string } }): Promise<Row | null> => {
      const row = this.rows.get(args.where.id);
      return Promise.resolve(row === undefined ? null : { ...row });
    },
    findMany: (args: { where: Where; take: number }): Promise<Row[]> =>
      Promise.resolve(
        this.matching(args.where)
          .slice(0, args.take)
          .map((row) => ({ ...row })),
      ),
    updateMany: (args: {
      where: Where;
      data: Row;
    }): Promise<{ count: number }> => {
      const matched = this.matching(args.where);
      for (const row of matched) {
        Object.assign(row, args.data, { updatedAt: new Date() });
      }
      return Promise.resolve({ count: matched.length });
    },
    deleteMany: (args: { where: Where }): Promise<{ count: number }> => {
      const matched = this.matching(args.where);
      for (const row of matched) {
        this.rows.delete(String(row.id));
      }
      return Promise.resolve({ count: matched.length });
    },
  };

  /** Inserts a row as the service would have, with the given fields changed. */
  seed(row: Row): void {
    this.rows.set(String(row.id), row);
  }

  private matching(where: Where): Row[] {
    return [...this.rows.values()].filter((row) =>
      Object.entries(where).every(([field, condition]) => {
        const value = row[field];
        if (
          typeof condition === 'object' &&
          condition !== null &&
          'lt' in condition &&
          condition.lt instanceof Date
        ) {
          return value instanceof Date && value < condition.lt;
        }
        return value === condition;
      }),
    );
  }
}

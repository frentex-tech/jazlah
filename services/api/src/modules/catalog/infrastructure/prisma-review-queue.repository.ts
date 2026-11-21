import { Injectable } from '@nestjs/common';
import { z } from 'zod';
import type { Page } from '@common/pagination/page.type';
import type { PageRequest } from '@common/pagination/page-request.type';
import { DbContext } from '@infra/database/db-context';
import { mapPrismaError } from '@infra/database/map-prisma-error';
import type { ReviewQueueRepository } from '../domain/ports/review-queue.repository.port';
import type { ReviewQueueFilter } from '../domain/review-queue-filter.type';
import type { ReviewQueueItem } from '../domain/review-queue-item.type';
import { REVIEW_QUEUE_ROW_SCHEMA } from './review-queue-row.schema';

const COUNT_SCHEMA = z.object({ count: z.number().int() });

/**
 * The review queue in one query: products `pending_review` (dated by `submitted_at`)
 * and `pending` change requests (dated by their `created_at`, the edit that opened
 * them, named with their live product) as one list, newest first, keyset on (date, id).
 * Raw SQL because Prisma cannot page a union; each status index narrows its half.
 * shortcut: no index on (status, submitted_at); the queue holds hundreds at most, so it
 * sorts in memory. Index it if the queue reaches thousands.
 */
@Injectable()
export class PrismaReviewQueueRepository implements ReviewQueueRepository {
  constructor(private readonly db: DbContext) {}

  async list(
    filter: ReviewQueueFilter,
    page: PageRequest,
  ): Promise<Page<ReviewQueueItem>> {
    const cursorAt = page.cursor?.createdAt ?? null;
    const cursorId = page.cursor?.id ?? null;
    try {
      const rows = await this.db.client.$queryRaw<unknown[]>`
        SELECT * FROM (
          SELECT 'product' AS "kind", p."id"::text AS "id", p."id"::text AS "productId",
                 NULL::text AS "changeRequestId", p."vendor_id"::text AS "vendorId",
                 p."name_ar" AS "nameAr", p."name_en" AS "nameEn",
                 p."submitted_at" AS "submittedAt"
          FROM "products" p
          WHERE p."status" = 'pending_review' AND p."submitted_at" IS NOT NULL
          UNION ALL
          SELECT 'change_request', r."id"::text, r."product_id"::text, r."id"::text,
                 p."vendor_id"::text, p."name_ar", p."name_en", r."created_at"
          FROM "product_change_requests" r
          JOIN "products" p ON p."id" = r."product_id"
          WHERE r."status" = 'pending'
        ) q
        WHERE (${filter.kind ?? null}::text IS NULL OR q."kind" = ${filter.kind ?? null}::text)
          AND (${filter.vendorId ?? null}::uuid IS NULL OR q."vendorId" = ${filter.vendorId ?? null}::text)
          AND (${cursorAt}::timestamptz IS NULL
               OR (q."submittedAt", q."id"::uuid) < (${cursorAt}::timestamptz, ${cursorId}::uuid))
        ORDER BY q."submittedAt" DESC, q."id"::uuid DESC
        LIMIT ${page.limit + 1}`;
      const items = rows
        .map((row) => REVIEW_QUEUE_ROW_SCHEMA.parse(row))
        .map((row): ReviewQueueItem => ({
          kind: row.kind,
          id: row.id,
          productId: row.productId,
          changeRequestId: row.changeRequestId,
          vendorId: row.vendorId,
          name: { ar: row.nameAr, en: row.nameEn },
          submittedAt: row.submittedAt,
        }));
      const shown = items.slice(0, page.limit);
      const last = shown.at(-1);
      return {
        items: shown,
        nextCursor:
          items.length > page.limit && last !== undefined
            ? { createdAt: last.submittedAt, id: last.id }
            : null,
      };
    } catch (error) {
      mapPrismaError(error);
    }
  }

  async count(filter: ReviewQueueFilter): Promise<number> {
    try {
      const rows = await this.db.client.$queryRaw<unknown[]>`
        SELECT count(*)::int AS "count" FROM (
          SELECT 'product' AS "kind", p."vendor_id" AS "vendorId"
          FROM "products" p
          WHERE p."status" = 'pending_review' AND p."submitted_at" IS NOT NULL
          UNION ALL
          SELECT 'change_request', p."vendor_id"
          FROM "product_change_requests" r
          JOIN "products" p ON p."id" = r."product_id"
          WHERE r."status" = 'pending'
        ) q
        WHERE (${filter.kind ?? null}::text IS NULL OR q."kind" = ${filter.kind ?? null}::text)
          AND (${filter.vendorId ?? null}::uuid IS NULL OR q."vendorId" = ${filter.vendorId ?? null}::uuid)`;
      return COUNT_SCHEMA.parse(rows[0]).count;
    } catch (error) {
      mapPrismaError(error);
    }
  }
}

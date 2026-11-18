import { Inject, Injectable } from '@nestjs/common';
import { AppError } from '@common/errors/app-error';
import { ErrorCode } from '@common/errors/error-code.enum';
import type { Page } from '@common/pagination/page.type';
import type { PageRequest } from '@common/pagination/page-request.type';
import { toPage } from '@common/pagination/to-page';
import { AuditLogWriter } from '@infra/audit/audit-log-writer';
import { DbContext } from '@infra/database/db-context';
import type { CoverageZone as CoverageZoneRow } from '@infra/database/generated/prisma/client';
import type { GeoJsonPolygon } from '@infra/database/geo-json-polygon.type';
import type { GeoPoint } from '@infra/database/geo-point.type';
import { keysetAfter } from '@infra/database/keyset-after';
import { KEYSET_ORDER } from '@infra/database/keyset-order.constants';
import { mapPrismaError } from '@infra/database/map-prisma-error';
import { pointFromLatLng } from '@infra/database/point-from-lat-lng';
import { polygonFromGeoJSON } from '@infra/database/polygon-from-geo-json';
import { toGeoJSON } from '@infra/database/to-geo-json';
import { TransactionRunner } from '@infra/database/transaction-runner';
import type { ActiveCoverageZone } from './active-coverage-zone.type';
import { ActiveCoverageZonesCache } from './active-coverage-zones.cache';
import { COVERAGE_AUDIT } from './coverage-audit-actions.constants';
import type { CoverageZone } from './coverage-zone.type';
import type { CoverageZoneChanges } from './coverage-zone-changes.type';
import type { CoveringZone } from './covering-zone.type';
import type { NewCoverageZone } from './new-coverage-zone.type';

/** Oldest first: when zones overlap, the oldest answers the coverage check. */
const OLDEST_FIRST = [{ createdAt: 'asc' }, { id: 'asc' }] as const;

/**
 * The coverage zones (table `coverage_zones`, FR-LOC-02): admins' list and changes, and
 * the database side of the coverage check. The polygon column is read and written only
 * through the geo helpers (raw SQL: the Prisma client cannot touch it); the other
 * columns through the client.
 *
 * A polygon is checked by PostGIS (ST_IsValid) before it is saved: INVALID_POLYGON when
 * it is not valid (edges that cross, among others), and the check constraint
 * `coverage_zones_polygon_check` holds it anyway. Every change is audited in its
 * transaction and invalidates the active zones cache after the commit.
 */
@Injectable()
export class CoverageZonesService {
  constructor(
    private readonly db: DbContext,
    // Narrowed to what is used, so a unit test passes a plain object.
    @Inject(TransactionRunner)
    private readonly transactions: Pick<TransactionRunner, 'run'>,
    private readonly audit: AuditLogWriter,
    private readonly cache: ActiveCoverageZonesCache,
  ) {}

  /** Every zone, active or not, newest first, one page. */
  async list(page: PageRequest): Promise<Page<CoverageZone>> {
    const rows = await this.query(() =>
      this.db.client.coverageZone.findMany({
        where: keysetAfter(page.cursor),
        orderBy: [...KEYSET_ORDER],
        take: page.limit + 1,
      }),
    );
    return toPage(await this.withPolygons(rows), page.limit);
  }

  /** One zone, or NOT_FOUND. */
  async get(id: string): Promise<CoverageZone> {
    const row = await this.query(() =>
      this.db.client.coverageZone.findUnique({ where: { id } }),
    );
    const [zone] = row === null ? [] : await this.withPolygons([row]);
    if (zone === undefined) {
      throw new AppError(ErrorCode.NOT_FOUND);
    }
    return zone;
  }

  /** Every active zone with its polygon, oldest first: what the cache keeps. */
  async listActive(): Promise<ActiveCoverageZone[]> {
    const rows = await this.query(() =>
      this.db.client.coverageZone.findMany({
        where: { isActive: true },
        orderBy: [...OLDEST_FIRST],
      }),
    );
    return (await this.withPolygons(rows)).map((zone) => ({
      id: zone.id,
      name: zone.name,
      city: zone.city,
      polygon: zone.polygon,
    }));
  }

  /**
   * The oldest active zone covering `point` (ST_Covers: a point on an edge counts),
   * found by the database on the GIST index; null when none does. The coverage check
   * while its cache is unavailable.
   */
  async findActiveZoneAt(point: GeoPoint): Promise<CoveringZone | null> {
    const rows = await this.query(
      () => this.db.client.$queryRaw<
        { id: string; nameAr: string; nameEn: string; city: string }[]
      >`
        SELECT "id", "name_ar" AS "nameAr", "name_en" AS "nameEn", "city"
        FROM "coverage_zones"
        WHERE "is_active"
          AND ST_Covers("polygon", ${pointFromLatLng(point.latitude, point.longitude)})
        ORDER BY "created_at", "id"
        LIMIT 1`,
    );
    const row = rows[0];
    return row === undefined
      ? null
      : {
          id: row.id,
          name: { ar: row.nameAr, en: row.nameEn },
          city: row.city,
        };
  }

  /** Adds a zone. INVALID_POLYGON, and nothing saved, when PostGIS finds the polygon invalid. */
  async create(zone: NewCoverageZone, actorId: string): Promise<CoverageZone> {
    await this.assertValid(zone.polygon);
    const id = await this.transactions.run(async () => {
      const rows = await this.query(
        () => this.db.client.$queryRaw<{ id: string }[]>`
          INSERT INTO "coverage_zones"
            ("name_ar", "name_en", "city", "polygon", "is_active", "updated_at")
          VALUES (${zone.name.ar}, ${zone.name.en}, ${zone.city},
            ${polygonFromGeoJSON(zone.polygon)}, ${zone.isActive}, CURRENT_TIMESTAMP)
          RETURNING "id"`,
      );
      const created = rows[0].id;
      await this.audit.write({
        actorId,
        ...COVERAGE_AUDIT.zoneCreated,
        entityId: created,
        metadata: { city: zone.city, isActive: zone.isActive },
      });
      return created;
    });
    await this.cache.invalidate();
    return this.get(id);
  }

  /**
   * Changes the fields given. NOT_FOUND for an unknown id; INVALID_POLYGON, and nothing
   * saved, for an invalid polygon.
   */
  async update(
    id: string,
    changes: CoverageZoneChanges,
    actorId: string,
  ): Promise<CoverageZone> {
    const { name, city, isActive, polygon } = changes;
    if (polygon !== undefined) {
      await this.assertValid(polygon);
    }
    await this.transactions.run(async () => {
      await this.lock(id);
      await this.query(() =>
        this.db.client.coverageZone.update({
          where: { id },
          data: { nameAr: name?.ar, nameEn: name?.en, city, isActive },
        }),
      );
      if (polygon !== undefined) {
        await this.query(
          () => this.db.client.$executeRaw`
            UPDATE "coverage_zones" SET "polygon" = ${polygonFromGeoJSON(polygon)}
            WHERE "id" = ${id}::uuid`,
        );
      }
      await this.audit.write({
        actorId,
        ...COVERAGE_AUDIT.zoneUpdated,
        entityId: id,
        metadata: {
          changed: Object.entries(changes)
            .filter(([, value]) => value !== undefined)
            .map(([field]) => field)
            .join(','),
          isActive: isActive ?? null,
        },
      });
    });
    await this.cache.invalidate();
    return this.get(id);
  }

  /** Deletes a zone for good. NOT_FOUND for an unknown id, also when already deleted. */
  async remove(id: string, actorId: string): Promise<void> {
    await this.transactions.run(async () => {
      const row = await this.lock(id);
      await this.query(() =>
        this.db.client.coverageZone.delete({ where: { id } }),
      );
      await this.audit.write({
        actorId,
        ...COVERAGE_AUDIT.zoneDeleted,
        entityId: id,
        metadata: { nameEn: row.nameEn, city: row.city },
      });
    });
    await this.cache.invalidate();
  }

  /** Locks the zone's row for the rest of the transaction; NOT_FOUND when there is none. */
  private async lock(id: string): Promise<{ nameEn: string; city: string }> {
    const rows = await this.query(
      () => this.db.client.$queryRaw<{ nameEn: string; city: string }[]>`
        SELECT "name_en" AS "nameEn", "city" FROM "coverage_zones"
        WHERE "id" = ${id}::uuid FOR UPDATE`,
    );
    const row = rows[0];
    if (row === undefined) {
      throw new AppError(ErrorCode.NOT_FOUND);
    }
    return row;
  }

  /** INVALID_POLYGON unless PostGIS finds the polygon valid (ST_IsValid). */
  private async assertValid(polygon: GeoJsonPolygon): Promise<void> {
    const rows = await this.query(
      () => this.db.client.$queryRaw<{ valid: boolean }[]>`
        SELECT ST_IsValid(${polygonFromGeoJSON(polygon)}) AS "valid"`,
    );
    if (rows[0]?.valid !== true) {
      throw new AppError(ErrorCode.INVALID_POLYGON);
    }
  }

  /** The rows with their polygons (read as GeoJSON), in the same order. */
  private async withPolygons(
    rows: readonly CoverageZoneRow[],
  ): Promise<CoverageZone[]> {
    if (rows.length === 0) {
      return [];
    }
    const ids = rows.map((row) => row.id);
    const polygons = await this.query(
      () => this.db.client.$queryRaw<{ id: string; polygon: string }[]>`
        SELECT "id", ST_AsGeoJSON("polygon") AS "polygon" FROM "coverage_zones"
        WHERE "id" = ANY(${ids}::uuid[])`,
    );
    const byId = new Map(
      polygons.map((each) => [each.id, toGeoJSON(each.polygon)]),
    );
    // A zone deleted between the two reads is left out.
    return rows.flatMap((row) => {
      const polygon = byId.get(row.id);
      return polygon === undefined
        ? []
        : [
            {
              id: row.id,
              name: { ar: row.nameAr, en: row.nameEn },
              city: row.city,
              polygon,
              isActive: row.isActive,
              createdAt: row.createdAt,
              updatedAt: row.updatedAt,
            },
          ];
    });
  }

  private async query<T>(work: () => Promise<T>): Promise<T> {
    try {
      return await work();
    } catch (error) {
      mapPrismaError(error);
    }
  }
}

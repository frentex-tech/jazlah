import { polygonFromGeoJSON } from '@infra/database/polygon-from-geo-json';
import { SEED_COVERAGE_ZONES } from './data/coverage-zones.constants';
import type { SeedContext } from './seed-context.type';
import { seedId } from './seed-id';
import { seedTime } from './seed-time';

/**
 * The sample coverage zones, each inserted only when its id is free (ON CONFLICT DO
 * NOTHING): a zone an admin redrew or switched off stays as they left it. Raw SQL with
 * the geo helper, as the coverage module writes polygons. A running API may keep its
 * cached zones list for up to five minutes after a first seed.
 */
export async function seedCoverageZones(context: SeedContext): Promise<void> {
  const { db, tally } = context;
  for (const [index, zone] of SEED_COVERAGE_ZONES.entries()) {
    const created = await db.client.$executeRaw`
      INSERT INTO "coverage_zones"
        ("id", "name_ar", "name_en", "city", "polygon", "is_active", "created_at", "updated_at")
      VALUES (${seedId(`coverage-zone:${zone.key}`)}::uuid, ${zone.nameAr}, ${zone.nameEn},
        ${zone.city}, ${polygonFromGeoJSON(zone.polygon)}, ${zone.isActive},
        ${seedTime(200 + index)}, ${seedTime(200 + index)})
      ON CONFLICT ("id") DO NOTHING`;
    tally.one('coverage zones', created === 1);
  }
}

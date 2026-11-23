import { Injectable } from '@nestjs/common';
import type { GeoPoint } from '@infra/database/geo-point.type';
import { isPointInPolygon } from '@infra/database/is-point-in-polygon';
import { ActiveCoverageZonesCache } from './active-coverage-zones.cache';
import { CoverageZonesService } from './coverage-zones.service';
import type { CoveringZone } from './covering-zone.type';

/**
 * Whether we deliver to a point (FR-LOC-03): the active coverage zone it lies in.
 * Exported for addresses (`isCovered` on each), checkout and kitchen assignment.
 *
 * Checked in memory against the cached active zones list (ActiveCoverageZonesCache),
 * loaded from the database on a miss; while the cache is unavailable, the database
 * answers with ST_Covers on the GIST index instead. Inactive zones never count. When
 * zones overlap, the oldest one is the answer.
 */
@Injectable()
export class CoverageService {
  constructor(
    private readonly zones: CoverageZonesService,
    private readonly cache: ActiveCoverageZonesCache,
  ) {}

  /** The active zone `point` lies in, or null when no zone covers it. */
  async findZone(point: GeoPoint): Promise<CoveringZone | null> {
    const cached = await this.cache.read();
    if (cached === null) {
      return this.zones.findActiveZoneAt(point);
    }
    let zones = cached.zones;
    if (zones === null) {
      zones = await this.zones.listActive();
      await this.cache.write(cached.version, zones);
    }
    const zone = zones.find((each) => isPointInPolygon(point, each.polygon));
    return zone === undefined
      ? null
      : { id: zone.id, name: zone.name, city: zone.city };
  }

  /** Whether an active zone covers `point`. */
  async isCovered(point: GeoPoint): Promise<boolean> {
    return (await this.findZone(point)) !== null;
  }
}

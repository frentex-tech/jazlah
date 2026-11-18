import type { CoverageZone } from './coverage-zone.type';
import type { CoverageZoneResponseDto } from './dto/coverage-zone-response.dto';

/** A zone as admins see it. */
export function toCoverageZoneResponse(
  zone: CoverageZone,
): CoverageZoneResponseDto {
  return {
    id: zone.id,
    name: { ar: zone.name.ar, en: zone.name.en },
    city: zone.city,
    polygon: {
      type: zone.polygon.type,
      coordinates: zone.polygon.coordinates.map((ring) =>
        ring.map(([longitude, latitude]) => [longitude, latitude]),
      ),
    },
    isActive: zone.isActive,
    color: zone.color,
    createdAt: zone.createdAt,
    updatedAt: zone.updatedAt,
  };
}

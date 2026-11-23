import { AppError } from '@common/errors/app-error';
import { ErrorCode } from '@common/errors/error-code.enum';
import type { GeoJsonPolygon } from '@infra/database/geo-json-polygon.type';
import { isGeoJsonPolygon } from '@infra/database/is-geo-json-polygon';
import type { GeoJsonPolygonDto } from './dto/geo-json-polygon.dto';

/** The polygon of a request, or INVALID_POLYGON when its rings are not GeoJSON rings. */
export function toPolygon(body: GeoJsonPolygonDto): GeoJsonPolygon {
  const polygon = { type: body.type, coordinates: body.coordinates };
  if (!isGeoJsonPolygon(polygon)) {
    throw new AppError(ErrorCode.INVALID_POLYGON);
  }
  return polygon;
}

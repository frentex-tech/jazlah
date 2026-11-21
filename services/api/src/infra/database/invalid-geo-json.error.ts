/**
 * The database returned GeoJSON that is not the polygon expected (toGeoJSON). It cannot
 * happen with a valid geometry column, so it ends as INTERNAL_ERROR.
 */
export class InvalidGeoJsonError extends Error {
  override readonly name = 'InvalidGeoJsonError';

  constructor() {
    super('The database returned GeoJSON that is not a polygon');
  }
}

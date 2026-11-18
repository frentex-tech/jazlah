import { ApiProperty } from '@nestjs/swagger';
import { ArrayMinSize, IsArray, IsIn } from 'class-validator';

/**
 * A GeoJSON polygon (RFC 7946), in and out. The shape of `coordinates` (closed rings of
 * `[longitude, latitude]`) and the polygon's validity are checked by the service, which
 * answers INVALID_POLYGON.
 */
export class GeoJsonPolygonDto {
  @ApiProperty({
    enum: ['Polygon'],
    description: 'Always `Polygon`.',
    example: 'Polygon',
  })
  @IsIn(['Polygon'])
  type!: 'Polygon';

  @ApiProperty({
    type: 'array',
    items: {
      type: 'array',
      minItems: 4,
      items: {
        type: 'array',
        minItems: 2,
        maxItems: 2,
        items: { type: 'number' },
      },
    },
    minItems: 1,
    description:
      'The rings, as GeoJSON: the outer boundary first, then any holes. Each ring is a list of at least four `[longitude, latitude]` positions in degrees (WGS 84; longitude first), the last repeating the first. Edges must not cross (INVALID_POLYGON otherwise).',
    example: [
      [
        [46.6, 24.6],
        [46.8, 24.6],
        [46.8, 24.8],
        [46.6, 24.8],
        [46.6, 24.6],
      ],
    ],
  })
  @IsArray()
  @ArrayMinSize(1)
  coordinates!: number[][][];
}

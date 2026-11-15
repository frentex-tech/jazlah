import { ApiProperty } from '@nestjs/swagger';
import { IsLatitude, IsLongitude } from 'class-validator';

/** A place on the map, in degrees. */
export class GeoPointDto {
  @ApiProperty({ minimum: -90, maximum: 90, example: 24.7136 })
  @IsLatitude()
  latitude!: number;

  @ApiProperty({ minimum: -180, maximum: 180, example: 46.6753 })
  @IsLongitude()
  longitude!: number;
}

import { ApiProperty } from '@nestjs/swagger';
import { IsLatitude, IsLongitude, IsNumber } from 'class-validator';

/**
 * A place on the map, in degrees, as JSON numbers: `@IsLatitude` and `@IsLongitude`
 * also accept numeric strings, which the database would refuse.
 */
export class GeoPointDto {
  @ApiProperty({ minimum: -90, maximum: 90, example: 24.7136 })
  @IsNumber({ allowNaN: false, allowInfinity: false })
  @IsLatitude()
  latitude!: number;

  @ApiProperty({ minimum: -180, maximum: 180, example: 46.6753 })
  @IsNumber({ allowNaN: false, allowInfinity: false })
  @IsLongitude()
  longitude!: number;
}

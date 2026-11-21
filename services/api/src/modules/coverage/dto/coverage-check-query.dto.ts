import { ApiProperty } from '@nestjs/swagger';
import { IsLatitude, IsLongitude } from 'class-validator';

/** The point to check, in degrees (query strings, read as numbers). */
export class CoverageCheckQueryDto {
  @ApiProperty({
    type: Number,
    minimum: -90,
    maximum: 90,
    description: 'Latitude in decimal degrees (WGS 84), -90 to 90.',
    example: 24.7136,
  })
  @IsLatitude()
  lat!: string;

  @ApiProperty({
    type: Number,
    minimum: -180,
    maximum: 180,
    description: 'Longitude in decimal degrees (WGS 84), -180 to 180.',
    example: 46.6753,
  })
  @IsLongitude()
  lng!: string;
}

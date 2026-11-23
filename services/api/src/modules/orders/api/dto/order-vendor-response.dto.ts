import { ApiProperty } from '@nestjs/swagger';
import { GeoPointDto } from '@common/dto/geo-point.dto';
import { LocalizedTextResponseDto } from '@common/dto/localized-text-response.dto';

/** The store that fulfils the order, with how to reach it. */
export class OrderVendorResponseDto {
  @ApiProperty({
    format: 'uuid',
    example: '7f3a2c1e-0b9d-4e5f-8a6b-1c2d3e4f5a6b',
    description: 'The vendor (UUID).',
  })
  id!: string;

  @ApiProperty({
    type: LocalizedTextResponseDto,
    description: 'The store’s name.',
  })
  name!: LocalizedTextResponseDto;

  @ApiProperty({
    type: String,
    nullable: true,
    example: '+966500000002',
    description:
      'The store’s contact number; null when it has none. Shown as "call the store".',
  })
  phone!: string | null;

  @ApiProperty({
    type: GeoPointDto,
    nullable: true,
    description: 'The store’s pin; null when it has none.',
  })
  location!: GeoPointDto | null;

  @ApiProperty({
    type: String,
    nullable: true,
    example: 'الرياض',
    description: 'The store’s city; null when not set.',
  })
  city!: string | null;
}

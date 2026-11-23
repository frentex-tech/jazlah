import { ApiProperty } from '@nestjs/swagger';
import { GeoPointDto } from '@common/dto/geo-point.dto';
import { LocalizedTextResponseDto } from '@common/dto/localized-text-response.dto';
import { TimeWindowDto } from '@common/dto/time-window.dto';

/** Where a pickup order is collected: the store’s location, contact and that day’s hours. */
export class PickupPointResponseDto {
  @ApiProperty({
    type: LocalizedTextResponseDto,
    description: 'The store’s name.',
  })
  name!: LocalizedTextResponseDto;

  @ApiProperty({
    type: LocalizedTextResponseDto,
    nullable: true,
    description:
      'The pickup address in words; null when the store has none yet.',
  })
  address!: LocalizedTextResponseDto | null;

  @ApiProperty({
    type: GeoPointDto,
    nullable: true,
    description: 'The pin, for directions; null when the store has none.',
  })
  location!: GeoPointDto | null;

  @ApiProperty({
    type: String,
    nullable: true,
    example: '+966500000002',
    description:
      'The store’s contact number (`+9665…` or a landline); null when it has none.',
  })
  phone!: string | null;

  @ApiProperty({
    type: TimeWindowDto,
    nullable: true,
    description:
      'The store’s hours on the chosen day, Riyadh time; null before a day is chosen or when unknown.',
  })
  hours!: TimeWindowDto | null;
}

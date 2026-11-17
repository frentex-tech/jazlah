import { ApiProperty } from '@nestjs/swagger';
import { GeoPointDto } from '@common/dto/geo-point.dto';
import { CUSTOMER_LIMITS } from '../customer-limits.constants';
import { SHORT_NATIONAL_ADDRESS } from '../short-national-address.constants';

/** A saved address. */
export class CustomerAddressResponseDto {
  @ApiProperty({
    format: 'uuid',
    description:
      'The address id (UUID), for the `{id}` of /v1/customer/addresses/{id}.',
    example: '7f3a2c1e-0b9d-4e5f-8a6b-1c2d3e4f5a6b',
  })
  id!: string;

  @ApiProperty({
    description: `The customer's name for the address (Home, Work), 1 to ${CUSTOMER_LIMITS.labelMax} characters.`,
    example: 'البيت',
  })
  label!: string;

  @ApiProperty({
    type: GeoPointDto,
    description: 'The point on the map, in degrees.',
  })
  location!: GeoPointDto;

  @ApiProperty({
    type: String,
    nullable: true,
    description: 'The city; null when the customer gave none.',
    example: 'الرياض',
  })
  city!: string | null;

  @ApiProperty({
    type: String,
    nullable: true,
    description:
      'The district (neighbourhood); null when the customer gave none.',
    example: 'حي الملقا',
  })
  district!: string | null;

  @ApiProperty({
    type: String,
    nullable: true,
    description: 'The street; null when the customer gave none.',
    example: 'طريق أنس بن مالك',
  })
  street!: string | null;

  @ApiProperty({
    type: String,
    nullable: true,
    description:
      'Building number, floor, apartment, as free text; null when the customer gave none.',
    example: 'مبنى 4321، الدور الثاني، شقة 5',
  })
  building!: string | null;

  @ApiProperty({
    type: String,
    nullable: true,
    pattern: SHORT_NATIONAL_ADDRESS.source,
    description:
      'The Saudi short national address, always four uppercase Latin letters then four Latin digits; null when the customer gave none.',
    example: 'RRRD2929',
  })
  shortNationalAddress!: string | null;

  @ApiProperty({
    type: String,
    nullable: true,
    description: `Notes for the driver, up to ${CUSTOMER_LIMITS.driverInstructionsMax} characters; null when the customer wrote none.`,
    example: 'الباب الجانبي، اتصل قبل الوصول',
  })
  driverInstructions!: string | null;

  @ApiProperty({
    description:
      "Whether this is the customer's default address. Exactly one address is the default once any exist.",
    example: true,
  })
  isDefault!: boolean;

  @ApiProperty({
    format: 'date-time',
    description: 'When the address was saved, UTC (ISO 8601).',
    example: '2026-11-15T10:00:00.000Z',
  })
  createdAt!: Date;

  @ApiProperty({
    format: 'date-time',
    description:
      'When the address last changed, UTC (ISO 8601); becoming or stopping being the default counts as a change.',
    example: '2026-11-15T10:00:00.000Z',
  })
  updatedAt!: Date;
}

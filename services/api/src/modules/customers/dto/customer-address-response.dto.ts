import { ApiProperty } from '@nestjs/swagger';
import { GeoPointDto } from '@common/dto/geo-point.dto';

/** A saved address. */
export class CustomerAddressResponseDto {
  @ApiProperty({
    format: 'uuid',
    example: '3d6f0a2b-8c1e-4f7a-9b2d-5e6f7a8b9c0d',
  })
  id!: string;

  @ApiProperty({ example: 'البيت' })
  label!: string;

  @ApiProperty({ type: GeoPointDto })
  location!: GeoPointDto;

  @ApiProperty({ type: String, nullable: true, example: 'الرياض' })
  city!: string | null;

  @ApiProperty({ type: String, nullable: true, example: 'حي الملقا' })
  district!: string | null;

  @ApiProperty({ type: String, nullable: true, example: 'طريق أنس بن مالك' })
  street!: string | null;

  @ApiProperty({
    type: String,
    nullable: true,
    example: 'مبنى 4321، الدور الثاني، شقة 5',
  })
  building!: string | null;

  @ApiProperty({ type: String, nullable: true, example: 'RRRD2929' })
  shortNationalAddress!: string | null;

  @ApiProperty({
    type: String,
    nullable: true,
    example: 'الباب الجانبي، اتصل قبل الوصول',
  })
  driverInstructions!: string | null;

  @ApiProperty({
    description: 'Exactly one address is the default once any exist.',
    example: true,
  })
  isDefault!: boolean;

  @ApiProperty({ format: 'date-time', example: '2026-11-17T09:00:00.000Z' })
  createdAt!: Date;

  @ApiProperty({ format: 'date-time', example: '2026-11-17T09:00:00.000Z' })
  updatedAt!: Date;
}

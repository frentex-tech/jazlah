import { ApiProperty } from '@nestjs/swagger';
import { GeoPointDto } from '@common/dto/geo-point.dto';

/** The delivery address as it was when the order was placed (later edits to the saved address do not change it). */
export class OrderAddressResponseDto {
  @ApiProperty({
    example: 'البيت',
    description: 'The address’s label.',
  })
  label!: string;

  @ApiProperty({
    type: GeoPointDto,
    description: 'The pin.',
  })
  location!: GeoPointDto;

  @ApiProperty({
    type: String,
    nullable: true,
    example: 'الرياض',
    description: 'City; null when not given.',
  })
  city!: string | null;

  @ApiProperty({
    type: String,
    nullable: true,
    example: 'الملقا',
    description: 'District; null when not given.',
  })
  district!: string | null;

  @ApiProperty({
    type: String,
    nullable: true,
    example: 'طريق أنس بن مالك',
    description: 'Street; null when not given.',
  })
  street!: string | null;

  @ApiProperty({
    type: String,
    nullable: true,
    example: '12',
    description: 'Building; null when not given.',
  })
  building!: string | null;

  @ApiProperty({
    type: String,
    nullable: true,
    example: 'RRRD2929',
    description: 'Short national address; null when not given.',
  })
  shortNationalAddress!: string | null;

  @ApiProperty({
    type: String,
    nullable: true,
    example: 'البوابة الشرقية',
    description: 'Notes for the driver; null for none.',
  })
  driverInstructions!: string | null;
}

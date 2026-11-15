import { ApiProperty } from '@nestjs/swagger';

/** One entry of a vendor's commission history. */
export class VendorCommissionChangeResponseDto {
  @ApiProperty({
    format: 'uuid',
    example: '7f3a2c1e-0b9d-4e5f-8a6b-1c2d3e4f5a6b',
  })
  id!: string;

  @ApiProperty({
    description: 'The new commission, basis points.',
    example: 1250,
  })
  commissionBasisPoints!: number;

  @ApiProperty({
    type: Number,
    nullable: true,
    description: 'The commission before; null for the first one.',
    example: 1000,
  })
  previousCommissionBasisPoints!: number | null;

  @ApiProperty({
    type: String,
    format: 'uuid',
    nullable: true,
    description: 'The admin who set it; null when the system did.',
    example: '5b1d9e2a-3c4f-4a6b-8d7e-9f0a1b2c3d4e',
  })
  changedById!: string | null;

  @ApiProperty({ example: '2026-11-15T10:00:00.000Z' })
  createdAt!: Date;
}

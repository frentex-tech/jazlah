import { ApiProperty } from '@nestjs/swagger';

/** One entry of a vendor's commission history. */
export class VendorCommissionChangeResponseDto {
  @ApiProperty({
    format: 'uuid',
    description: 'The history entry id, a UUID.',
    example: '7f3a2c1e-0b9d-4e5f-8a6b-1c2d3e4f5a6b',
  })
  id!: string;

  @ApiProperty({
    description:
      'The commission set, in basis points (0 to 10000): 1250 is 12.5%.',
    example: 1250,
  })
  commissionBasisPoints!: number;

  @ApiProperty({
    type: Number,
    nullable: true,
    description:
      'The commission before this change, in basis points; null for the vendor’s first commission (set at approval).',
    example: 1000,
  })
  previousCommissionBasisPoints!: number | null;

  @ApiProperty({
    type: String,
    format: 'uuid',
    nullable: true,
    description:
      'The admin (user UUID) who set it; null when the system did (the platform vendor’s creation).',
    example: '5b1d9e2a-3c4f-4a6b-8d7e-9f0a1b2c3d4e',
  })
  changedById!: string | null;

  @ApiProperty({
    description: 'When the change was made, UTC ISO 8601.',
    example: '2026-11-15T10:00:00.000Z',
  })
  createdAt!: Date;
}

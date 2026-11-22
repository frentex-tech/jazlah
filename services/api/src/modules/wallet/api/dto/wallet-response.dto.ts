import { ApiProperty } from '@nestjs/swagger';

/** The customer’s wallet. */
export class WalletResponseDto {
  @ApiProperty({
    type: 'integer',
    example: 5000,
    description:
      'The balance, in halalas; never below 0. The wallet part of an unpaid order past its `expiresAt` is already back in it.',
  })
  balanceHalalas!: number;
}

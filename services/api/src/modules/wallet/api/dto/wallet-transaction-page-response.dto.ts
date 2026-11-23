import { ApiProperty } from '@nestjs/swagger';
import { WalletTransactionResponseDto } from './wallet-transaction-response.dto';

/** One page of wallet movements, newest first. */
export class WalletTransactionPageResponseDto {
  @ApiProperty({
    type: [WalletTransactionResponseDto],
    description: 'The movements on this page.',
  })
  items!: WalletTransactionResponseDto[];

  @ApiProperty({
    type: String,
    nullable: true,
    example: 'eyJjIjoiMjAyNi0xMS0yMlQwOTowMDowMC4wMDBaIn0',
    description: 'Send as `cursor` for the next page; null on the last.',
  })
  nextCursor!: string | null;
}

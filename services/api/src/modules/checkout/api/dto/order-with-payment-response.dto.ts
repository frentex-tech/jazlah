import { ApiProperty } from '@nestjs/swagger';
import { OrderResponseDto } from '@modules/orders';
import { PaymentResponseDto } from '@modules/payments';

/** An order and its payment attempt: what placing an order or starting a new payment answers. */
export class OrderWithPaymentResponseDto {
  @ApiProperty({
    type: OrderResponseDto,
    description: 'The order as it is now.',
  })
  order!: OrderResponseDto;

  @ApiProperty({
    type: PaymentResponseDto,
    nullable: true,
    description:
      'The payment attempt; null when nothing is paid online (cash on delivery, wallet only): no payment record is made.',
  })
  payment!: PaymentResponseDto | null;
}

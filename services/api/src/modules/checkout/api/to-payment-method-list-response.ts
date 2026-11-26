import type { Money } from '@common/money/money';
import type { PaymentMethodOption } from '../domain/payment-method-option.type';
import type { PaymentMethodListResponseDto } from './dto/payment-method-list-response.dto';

/** The payment methods as the contract shows them. */
export function toPaymentMethodListResponse(
  list: Readonly<{
    items: readonly PaymentMethodOption[];
    walletBalance: Money;
    total: Money;
  }>,
): PaymentMethodListResponseDto {
  return {
    items: list.items.map((item) => ({ ...item })),
    walletBalanceHalalas: list.walletBalance.halalas,
    totalHalalas: list.total.halalas,
  };
}

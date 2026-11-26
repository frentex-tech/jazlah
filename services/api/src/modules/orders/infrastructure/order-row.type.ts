import type {
  Order as OrderRow,
  OrderItem as OrderItemRow,
  OrderStatusHistory as OrderStatusHistoryRow,
} from '@infra/database/generated/prisma/client';

/** An `orders` row with its lines (in order) and its history (oldest first). */
export type OrderWithDetailsRow = OrderRow & {
  items: OrderItemRow[];
  history: OrderStatusHistoryRow[];
};

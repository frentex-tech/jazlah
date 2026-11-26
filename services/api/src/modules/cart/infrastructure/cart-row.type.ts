import type {
  Cart as CartRow,
  CartItem as CartItemRow,
} from '@infra/database/generated/prisma/client';

/** A `carts` row with its lines, in the order added. */
export type CartWithItemsRow = CartRow & { items: CartItemRow[] };

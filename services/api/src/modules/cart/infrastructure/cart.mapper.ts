import { Money } from '@common/money/money';
import type { Prisma } from '@infra/database/generated/prisma/client';
import { ProductPackaging } from '@infra/database/generated/prisma/enums';
import { Cart } from '../domain/cart.entity';
import type { CartLine } from '../domain/cart-line.type';
import type { CartWithItemsRow } from './cart-row.type';
import { LINE_DISPLAY_SCHEMA } from './line-display.schema';

/** Rows of `carts` and `cart_items` to the `Cart` entity and back. */
export const CartMapper = {
  toEntity(row: CartWithItemsRow): Cart {
    return Cart.restore(
      row.id,
      row.userId,
      row.vendorId,
      row.items.map((item): CartLine => ({
        id: item.id,
        choice: {
          productId: item.productId,
          sizeId: item.sizeId,
          cuttingStyleId: item.cuttingStyleId,
          packaging: item.packaging,
          exclusionItemIds: [...item.exclusionItemIds].sort(),
          notes: item.notes,
        },
        quantity: item.quantity,
        unitPrice: Money.of(item.unitPriceHalalas),
        display: LINE_DISPLAY_SCHEMA.parse(item.display),
      })),
    );
  },

  /** The columns of a line, apart from its cart. */
  toItemData(
    line: CartLine,
  ): Omit<Prisma.CartItemUncheckedCreateInput, 'cartId' | 'id'> {
    return {
      productId: line.choice.productId,
      sizeId: line.choice.sizeId,
      cuttingStyleId: line.choice.cuttingStyleId,
      packaging: CartMapper.toPackaging(line.choice.packaging),
      exclusionItemIds: [...line.choice.exclusionItemIds],
      notes: line.choice.notes,
      quantity: line.quantity,
      unitPriceHalalas: line.unitPrice.halalas,
      configurationKey: Cart.configurationKey(line.choice),
      display: {
        ...line.display,
        size: { ...line.display.size },
        exclusions: line.display.exclusions.map((item) => ({ ...item })),
      },
    };
  },

  /** The column value of a packaging name; the request DTO allows only these names. */
  toPackaging(
    name: string | null,
  ): (typeof ProductPackaging)[keyof typeof ProductPackaging] | null {
    if (name === null) {
      return null;
    }
    const found = Object.values(ProductPackaging).find(
      (value) => value === name,
    );
    if (found === undefined) {
      throw new RangeError(`Not a packaging: ${name}`);
    }
    return found;
  },
};

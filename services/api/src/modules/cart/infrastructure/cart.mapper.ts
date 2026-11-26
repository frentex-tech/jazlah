import { Money } from '@common/money/money';
import type { Prisma } from '@infra/database/generated/prisma/client';
import { ProductPackaging } from '@infra/database/generated/prisma/enums';
import { Cart } from '../domain/cart.entity';
import type { CartFulfilment } from '../domain/cart-fulfilment.type';
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
      CartMapper.toFulfilment(row),
    );
  },

  /** The chosen fulfilment of a row; null when none (the check constraint keeps the three columns together). */
  toFulfilment(
    row: Pick<
      CartWithItemsRow,
      'fulfilmentMethod' | 'fulfilmentAddressId' | 'fulfilmentDate'
    >,
  ): CartFulfilment | null {
    if (row.fulfilmentMethod === null || row.fulfilmentDate === null) {
      return null;
    }
    return {
      method: row.fulfilmentMethod,
      addressId: row.fulfilmentAddressId,
      // A DATE column comes back as UTC midnight of that calendar day.
      date: row.fulfilmentDate.toISOString().slice(0, 10),
    };
  },

  /** The fulfilment columns of a cart. */
  toFulfilmentData(fulfilment: CartFulfilment | null): {
    fulfilmentMethod: CartFulfilment['method'] | null;
    fulfilmentAddressId: string | null;
    fulfilmentDate: Date | null;
  } {
    return {
      fulfilmentMethod: fulfilment?.method ?? null,
      fulfilmentAddressId: fulfilment?.addressId ?? null,
      fulfilmentDate:
        fulfilment === null ? null : new Date(`${fulfilment.date}T00:00:00Z`),
    };
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

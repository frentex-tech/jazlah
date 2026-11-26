import type { PricedCartLine } from '@modules/cart';
import type { NewOrderLine } from '@modules/orders';

/** A priced cart line as a line of the order to create: names as shown now, the unit price today's catalog price. */
export function toOrderLine(line: PricedCartLine): NewOrderLine {
  const { choice } = line.line;
  return {
    productId: choice.productId,
    sizeId: choice.sizeId,
    quantity: line.line.quantity,
    // Equal to today's catalog price: a moved price was refused before this.
    unitPrice: line.line.unitPrice,
    packaging: choice.packaging,
    notes: choice.notes,
    imageUrl: line.imageUrl,
    names: {
      name: line.display.name,
      size: line.display.size,
      cutting: line.display.cutting,
      exclusions: line.display.exclusions,
    },
  };
}

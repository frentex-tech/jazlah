import { AppError } from '@common/errors/app-error';
import { ErrorCode } from '@common/errors/error-code.enum';
import type { LocalizedText } from '@common/i18n/localized-text.type';
import type { Money } from '@common/money/money';
import { CART_LIMITS } from './cart-limits.constants';
import type { CartLine } from './cart-line.type';
import type { LineChoice } from './line-choice.type';
import type { LineDisplay } from './line-display.type';

/**
 * A customer's cart (CRT-API-1, FR-CRT-01): lines of one store, each a choice with its
 * quantity and the unit price the customer accepted. The rules every write keeps:
 *
 * - **One store.** A line of another store is CART_VENDOR_MISMATCH
 *   (`details.vendorId`, `details.vendorName`: the cart's store) unless the customer
 *   agreed to replace the cart.
 * - **One line per choice.** The same choice (`configurationKey`) adds to its line; past
 *   99 it is VALIDATION_FAILED on `quantity` (`max`), nothing changed.
 * - **The accepted price.** Adding or changing a line takes today's price: that is how a
 *   customer accepts a changed price.
 * - An empty cart has no store.
 */
export class Cart {
  private constructor(
    readonly id: string | null,
    readonly userId: string,
    private storeId: string | null,
    private items: CartLine[],
  ) {}

  /** A cart as saved. */
  static restore(
    id: string,
    userId: string,
    vendorId: string | null,
    lines: readonly CartLine[],
  ): Cart {
    return new Cart(id, userId, vendorId, [...lines]);
  }

  /** The cart of a customer who has none yet. */
  static empty(userId: string): Cart {
    return new Cart(null, userId, null, []);
  }

  /**
   * The key that names a choice: the same product, size, cutting style, packaging,
   * "without" items (in any order) and note are one line.
   */
  static configurationKey(choice: LineChoice): string {
    return JSON.stringify([
      choice.productId,
      choice.sizeId,
      choice.cuttingStyleId,
      choice.packaging,
      [...choice.exclusionItemIds].sort(),
      choice.notes,
    ]);
  }

  get vendorId(): string | null {
    return this.storeId;
  }

  get lines(): readonly CartLine[] {
    return this.items;
  }

  /**
   * Adds `quantity` of `choice` at today's `unitPrice`. `vendorId` is the product's
   * store; `currentVendorName` is the cart's store name for the mismatch details.
   */
  add(
    item: Readonly<{
      choice: LineChoice;
      quantity: number;
      unitPrice: Money;
      vendorId: string;
      display: LineDisplay;
    }>,
    options: Readonly<{
      replaceCart: boolean;
      currentVendorName: LocalizedText | null;
    }>,
  ): void {
    if (this.storeId !== null && this.storeId !== item.vendorId) {
      if (!options.replaceCart) {
        throw new AppError(ErrorCode.CART_VENDOR_MISMATCH, {
          details: {
            vendorId: this.storeId,
            vendorName: options.currentVendorName,
          },
        });
      }
      this.items = [];
    }
    const key = Cart.configurationKey(item.choice);
    const index = this.items.findIndex(
      (line) => Cart.configurationKey(line.choice) === key,
    );
    const existing = index === -1 ? undefined : this.items[index];
    const quantity = (existing?.quantity ?? 0) + item.quantity;
    Cart.assertQuantity(quantity);
    const line: CartLine = {
      id: existing?.id ?? null,
      choice: item.choice,
      quantity,
      unitPrice: item.unitPrice,
      display: item.display,
    };
    this.items =
      index === -1
        ? [...this.items, line]
        : this.items.map((other, i) => (i === index ? line : other));
    this.storeId = item.vendorId;
  }

  /** Sets a line's quantity at today's price (accepting a changed price). NOT_FOUND for a line not in the cart. */
  changeQuantity(
    lineId: string,
    quantity: number,
    unitPrice: Money,
    display: LineDisplay,
  ): void {
    const line = this.lineOf(lineId);
    Cart.assertQuantity(quantity);
    this.items = this.items.map((other) =>
      other === line ? { ...line, quantity, unitPrice, display } : other,
    );
  }

  /** Removes a line; the last one leaves the cart without a store. NOT_FOUND for a line not in the cart. */
  remove(lineId: string): void {
    const line = this.lineOf(lineId);
    this.items = this.items.filter((other) => other !== line);
    if (this.items.length === 0) {
      this.storeId = null;
    }
  }

  /** Removes every line. */
  clear(): void {
    this.items = [];
    this.storeId = null;
  }

  /** The line `lineId`, or NOT_FOUND. */
  lineOf(lineId: string): CartLine {
    const line = this.items.find((other) => other.id === lineId);
    if (line === undefined) {
      throw new AppError(ErrorCode.NOT_FOUND);
    }
    return line;
  }

  private static assertQuantity(quantity: number): void {
    if (quantity > CART_LIMITS.maxQuantity) {
      throw new AppError(ErrorCode.VALIDATION_FAILED, {
        details: [{ field: 'quantity', constraints: ['max'] }],
      });
    }
  }
}

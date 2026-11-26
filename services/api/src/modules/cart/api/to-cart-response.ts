import { PRODUCT_PACKAGINGS } from '@modules/catalog';
import type { CartIssue } from '../domain/cart-issue.type';
import type { PricedCart } from '../domain/priced-cart.type';
import type { PricedCartLine } from '../domain/priced-cart-line.type';
import type { PricedFulfilment } from '../domain/priced-fulfilment.type';
import type { CartFulfilmentResponseDto } from './dto/cart-fulfilment-response.dto';
import type { CartIssueResponseDto } from './dto/cart-issue-response.dto';
import type { CartLineResponseDto } from './dto/cart-line-response.dto';
import type { CartResponseDto } from './dto/cart-response.dto';

/**
 * A priced cart as the contract shows it. No coupon yet (CRT-API-3): null. The store is null when its name is unknown, which only a
 * deleted vendor causes, and that deletes the cart with it.
 */
export function toCartResponse(cart: PricedCart): CartResponseDto {
  return {
    vendor:
      cart.vendorId === null || cart.vendorName === null
        ? null
        : { id: cart.vendorId, name: { ...cart.vendorName } },
    lines: cart.lines.map(toLine),
    coupon: null,
    fulfilment: cart.fulfilment === null ? null : toFulfilment(cart.fulfilment),
    subtotalHalalas: cart.subtotal.halalas,
    discountHalalas: cart.discount.halalas,
    deliveryFeeHalalas: cart.deliveryFee.halalas,
    totalHalalas: cart.total.halalas,
    vatHalalas: cart.vat.halalas,
    minOrderHalalas: cart.minOrder.halalas,
    minOrderRemainingHalalas: cart.minOrderRemaining.halalas,
    issues: cart.issues.map(toIssue),
    canCheckout: cart.canCheckout,
  };
}

function toLine({
  id,
  line,
  display,
  imageUrl,
  isAvailable,
  total,
}: PricedCartLine): CartLineResponseDto {
  return {
    id,
    productId: line.choice.productId,
    name: { ...display.name },
    imageUrl,
    size: {
      id: display.size.id,
      approxWeightGrams: display.size.approxWeightGrams,
      tag: display.size.tag === null ? null : { ...display.size.tag },
    },
    cutting:
      display.cutting === null
        ? null
        : { id: display.cutting.id, name: { ...display.cutting.name } },
    packaging:
      PRODUCT_PACKAGINGS.find((name) => name === line.choice.packaging) ?? null,
    exclusions: display.exclusions.map((item) => ({
      id: item.id,
      name: { ...item.name },
    })),
    notes: line.choice.notes,
    quantity: line.quantity,
    unitPriceHalalas: line.unitPrice.halalas,
    totalHalalas: total.halalas,
    isAvailable,
  };
}

function toFulfilment(fulfilment: PricedFulfilment): CartFulfilmentResponseDto {
  const point = fulfilment.pickupPoint;
  return {
    method: fulfilment.method,
    addressId: fulfilment.addressId,
    date: fulfilment.date,
    window: fulfilment.window === null ? null : { ...fulfilment.window },
    pickupPoint:
      point === null
        ? null
        : {
            name: { ...point.name },
            address: point.address === null ? null : { ...point.address },
            location: point.location === null ? null : { ...point.location },
            phone: point.phone,
            hours: point.hours === null ? null : { ...point.hours },
          },
  };
}

function toIssue(issue: CartIssue): CartIssueResponseDto {
  return issue.code === 'PRICE_CHANGED'
    ? {
        code: issue.code,
        lineId: issue.lineId,
        oldUnitPriceHalalas: issue.oldUnitPrice.halalas,
        newUnitPriceHalalas: issue.newUnitPrice.halalas,
      }
    : {
        code: issue.code,
        lineId: issue.lineId,
        oldUnitPriceHalalas: null,
        newUnitPriceHalalas: null,
      };
}

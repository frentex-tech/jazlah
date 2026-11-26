import { Inject, Injectable } from '@nestjs/common';
import { AppError } from '@common/errors/app-error';
import { ErrorCode } from '@common/errors/error-code.enum';
import { hashRequestBody } from '@common/crypto/hash-request-body';
import { Money } from '@common/money/money';
import { IdempotencyRunner } from '@infra/database/idempotency-runner';
import { TransactionRunner } from '@infra/database/transaction-runner';
import {
  ClearCartUseCase,
  LockCartForCheckoutUseCase,
  type PricedCart,
  type PricedCartLine,
} from '@modules/cart';
import {
  CustomerAddressesService,
  CustomerProfilesService,
} from '@modules/customers';
import {
  CreateOrderUseCase,
  FindCustomerOrderUseCase,
  orderTypeOf,
  type NewOrder,
  type Order,
  type OrderAddressSnapshot,
  type OrderPickupSnapshot,
} from '@modules/orders';
import { CapacityService, SchedulingService } from '@modules/scheduling';
import { UsersService } from '@modules/users';
import { VendorDirectory } from '@modules/vendors';
import { assertOrderingOpen } from '../domain/assert-ordering-open';
import { paymentMethodsFor } from '../domain/payment-methods-for';
import type { PlaceOrderRequest } from '../domain/place-order-request.type';
import {
  CHECKOUT_SETTINGS,
  type CheckoutSettings,
} from '../domain/ports/checkout-settings.port';

/** The name the once-only key of placing an order is kept under (`idempotency_keys.operation`). */
const OPERATION = 'place-order';

/** What a placement leaves in the key's stored outcome: the order and the request that made it. */
type PlacedOutcome = { orderId: string; bodyHash: string };

/**
 * Turns the customer's cart into an order (POST /v1/customer/orders, ORD-API-1), cash
 * on delivery only, in one transaction keyed by `Idempotency-Key`:
 *
 * - **The key.** Kept per customer with a hash of the request body
 *   (`IdempotencyRunner.runOnce`). The same key and body answer the first order again,
 *   whatever the cart is now; the same key with another body is IDEMPOTENCY_KEY_REUSED;
 *   two requests at once with one key make one order. A refusal keeps nothing.
 * - **The cart.** ORDERING_PAUSED; then its row is locked and read again
 *   (`LockCartForCheckoutUseCase`), so two placements of one cart happen one after the
 *   other; CART_EMPTY for an empty cart.
 * - **The customer.** PROFILE_INCOMPLETE without a full name.
 * - **The lines**, priced again on the server by the catalog, never by the client: lines
 *   no longer orderable (unpublished, off, a store not active, an incompatible cutting
 *   and packaging) are ITEM_UNAVAILABLE and lines whose price moved since the customer
 *   accepted it are PRICE_CHANGED, both with `details.lineIds` (nothing is charged at a
 *   price the customer did not see); then MIN_ORDER_NOT_MET.
 * - **Fulfilment.** FULFILMENT_REQUIRED (none chosen, or the address is gone),
 *   FULFILMENT_NOT_SUPPORTED, ADDRESS_NOT_COVERED, then the day through the scheduling
 *   engine, as the days route does (DAY_NOT_AVAILABLE, DAY_FULL), and its capacity
 *   taken by `CapacityService.reserve` (an atomic conditional update: of two orders for
 *   the last place, one wins).
 * - **Payment.** Only cash on delivery, and only when the cart may use it
 *   (`paymentMethodsFor`): another method is PAYMENT_METHOD_NOT_AVAILABLE
 *   (`details.method`), a wallet part is WALLET_INSUFFICIENT (the balance is 0).
 * - **The order** is made by `CreateOrderUseCase` with snapshots of everything, the
 *   cart is emptied, and the order-placed event is delivered after the commit.
 */
@Injectable()
export class PlaceOrderUseCase {
  constructor(
    @Inject(TransactionRunner)
    private readonly transactions: Pick<TransactionRunner, 'run'>,
    @Inject(IdempotencyRunner)
    private readonly idempotency: Pick<IdempotencyRunner, 'runOnce'>,
    @Inject(CHECKOUT_SETTINGS) private readonly settings: CheckoutSettings,
    @Inject(LockCartForCheckoutUseCase)
    private readonly carts: Pick<LockCartForCheckoutUseCase, 'execute'>,
    @Inject(ClearCartUseCase)
    private readonly clearCart: Pick<ClearCartUseCase, 'execute'>,
    @Inject(CustomerProfilesService)
    private readonly profiles: Pick<CustomerProfilesService, 'profileOf'>,
    @Inject(CustomerAddressesService)
    private readonly addresses: Pick<CustomerAddressesService, 'get'>,
    @Inject(UsersService)
    private readonly users: Pick<UsersService, 'findById'>,
    @Inject(VendorDirectory)
    private readonly vendors: Pick<
      VendorDirectory,
      'storeOf' | 'commissionBasisPointsOf'
    >,
    @Inject(SchedulingService)
    private readonly scheduling: Pick<
      SchedulingService,
      'assertDayAvailable' | 'pickupTerms'
    >,
    @Inject(CapacityService)
    private readonly capacity: Pick<CapacityService, 'reserve'>,
    @Inject(CreateOrderUseCase)
    private readonly createOrder: Pick<CreateOrderUseCase, 'execute'>,
    @Inject(FindCustomerOrderUseCase)
    private readonly findOrder: Pick<FindCustomerOrderUseCase, 'execute'>,
  ) {}

  async execute(
    userId: string,
    idempotencyKey: string,
    request: PlaceOrderRequest,
  ): Promise<Order> {
    const bodyHash = hashRequestBody(request);
    const outcome = await this.transactions.run(async () => {
      const stored = await this.idempotency.runOnce<PlacedOutcome>(
        OPERATION,
        `${userId}:${idempotencyKey}`,
        () => this.place(userId, request, bodyHash),
      );
      if (stored.bodyHash !== bodyHash) {
        throw new AppError(ErrorCode.IDEMPOTENCY_KEY_REUSED);
      }
      return stored;
    });
    return this.findOrder.execute(userId, outcome.orderId);
  }

  private async place(
    userId: string,
    request: PlaceOrderRequest,
    bodyHash: string,
  ): Promise<PlacedOutcome> {
    assertOrderingOpen(await this.settings.pause());
    const cart = await this.carts.execute(userId);
    if (cart.vendorId === null || cart.lines.length === 0) {
      throw new AppError(ErrorCode.CART_EMPTY);
    }
    const customer = await this.customerOf(userId);
    assertLinesOrderable(cart);
    assertMinimumReached(cart);
    const { fulfilment } = cart;
    if (fulfilment === null) {
      throw new AppError(ErrorCode.FULFILMENT_REQUIRED);
    }
    if (
      cart.lines.some(
        (line) =>
          line.fulfilment !== 'both' && line.fulfilment !== fulfilment.method,
      )
    ) {
      throw new AppError(ErrorCode.FULFILMENT_NOT_SUPPORTED);
    }
    const address =
      fulfilment.method === 'delivery'
        ? await this.addressOf(userId, fulfilment.addressId)
        : null;
    const day = await this.scheduling.assertDayAvailable(
      {
        vendorId: cart.vendorId,
        method: fulfilment.method,
        orderTypes: cart.orderTypes,
      },
      fulfilment.date,
    );
    await this.assertPaymentAllowed(cart, request);
    const [store, commission] = await Promise.all([
      this.vendors.storeOf(cart.vendorId),
      this.vendors.commissionBasisPointsOf(cart.vendorId),
    ]);
    if (store === null || commission === null) {
      throw new AppError(ErrorCode.ITEM_UNAVAILABLE, {
        details: { lineIds: cart.lines.map((line) => line.id) },
      });
    }
    const pickupPoint: OrderPickupSnapshot | null =
      fulfilment.method === 'pickup'
        ? (await this.scheduling.pickupTerms(cart.vendorId)).point
        : null;
    const carcasses = 0;
    await this.capacity.reserve({
      vendorId: cart.vendorId,
      date: fulfilment.date,
      carcasses,
    });
    const order = await this.createOrder.execute({
      userId,
      customer,
      vendorId: cart.vendorId,
      vendor: {
        name: store.name,
        phone: store.contactPhone,
        location: store.location,
        city: store.city,
      },
      commissionBasisPoints: commission,
      orderType: orderTypeOf(cart.orderTypes),
      lines: cart.lines.map(toOrderLine),
      fulfilment: fulfilment.method,
      fulfilmentDate: fulfilment.date,
      window: fulfilment.method === 'delivery' ? day.window : null,
      address,
      pickupPoint,
      deliveryFee: cart.deliveryFee,
      paymentMethod: 'cod',
      notes: request.notes ?? null,
      carcasses,
    } satisfies NewOrder);
    await this.clearCart.execute(userId);
    return { orderId: order.id, bodyHash };
  }

  /** The name and mobile to keep on the order; PROFILE_INCOMPLETE without a full name. */
  private async customerOf(
    userId: string,
  ): Promise<{ name: string; phone: string }> {
    const [profile, user] = await Promise.all([
      this.profiles.profileOf(userId),
      this.users.findById(userId),
    ]);
    if (profile.fullName === null) {
      throw new AppError(ErrorCode.PROFILE_INCOMPLETE);
    }
    if (user === null) {
      throw new AppError(ErrorCode.NOT_FOUND);
    }
    return { name: profile.fullName, phone: user.phone };
  }

  /** The delivery address as it is now; FULFILMENT_REQUIRED when it was deleted, ADDRESS_NOT_COVERED outside every active zone. */
  private async addressOf(
    userId: string,
    addressId: string | null,
  ): Promise<OrderAddressSnapshot> {
    if (addressId === null) {
      throw new AppError(ErrorCode.FULFILMENT_REQUIRED);
    }
    let address;
    try {
      address = await this.addresses.get(userId, addressId);
    } catch (error) {
      if (error instanceof AppError && error.code === ErrorCode.NOT_FOUND) {
        throw new AppError(ErrorCode.FULFILMENT_REQUIRED, { cause: error });
      }
      throw error;
    }
    if (!address.isCovered) {
      throw new AppError(ErrorCode.ADDRESS_NOT_COVERED);
    }
    return {
      label: address.label,
      location: address.location,
      city: address.city,
      district: address.district,
      street: address.street,
      building: address.building,
      shortNationalAddress: address.shortNationalAddress,
      driverInstructions: address.driverInstructions,
    };
  }

  private async assertPaymentAllowed(
    cart: PricedCart,
    request: PlaceOrderRequest,
  ): Promise<void> {
    if (request.paymentMethod !== 'cod') {
      throw new AppError(ErrorCode.PAYMENT_METHOD_NOT_AVAILABLE, {
        details: { method: request.paymentMethod },
      });
    }
    if ((request.walletAmountHalalas ?? 0) > 0) {
      throw new AppError(ErrorCode.WALLET_INSUFFICIENT, {
        details: { balanceHalalas: 0 },
      });
    }
    const offered = paymentMethodsFor(
      {
        vendorId: cart.vendorId,
        lineFulfilments: [],
        orderTypes: cart.orderTypes,
        total: cart.total,
      },
      await this.settings.cod(),
    );
    if (!offered.some((option) => option.method === 'cod')) {
      throw new AppError(ErrorCode.PAYMENT_METHOD_NOT_AVAILABLE, {
        details: { method: 'cod' },
      });
    }
  }
}

/** ITEM_UNAVAILABLE, then PRICE_CHANGED, each naming the lines. */
function assertLinesOrderable(cart: PricedCart): void {
  for (const code of ['ITEM_UNAVAILABLE', 'PRICE_CHANGED'] as const) {
    const lineIds = cart.issues
      .filter((issue) => issue.code === code)
      .map((issue) => issue.lineId);
    if (lineIds.length > 0) {
      throw new AppError(ErrorCode[code], { details: { lineIds } });
    }
  }
}

function assertMinimumReached(cart: PricedCart): void {
  if (cart.minOrderRemaining.isGreaterThan(Money.zero())) {
    throw new AppError(ErrorCode.MIN_ORDER_NOT_MET, {
      details: {
        minOrderHalalas: cart.minOrder.halalas,
        remainingHalalas: cart.minOrderRemaining.halalas,
      },
    });
  }
}

function toOrderLine(line: PricedCartLine): NewOrder['lines'][number] {
  const { choice } = line.line;
  return {
    productId: choice.productId,
    sizeId: choice.sizeId,
    quantity: line.line.quantity,
    // Equal to today's catalog price: a moved price was refused above.
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

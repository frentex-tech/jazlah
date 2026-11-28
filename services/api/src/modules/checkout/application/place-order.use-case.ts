import { Inject, Injectable } from '@nestjs/common';
import { hashRequestBody } from '@common/crypto/hash-request-body';
import { AppError } from '@common/errors/app-error';
import { ErrorCode } from '@common/errors/error-code.enum';
import { IdempotencyRunner } from '@infra/database/idempotency-runner';
import { TransactionRunner } from '@infra/database/transaction-runner';
import { ClearCartUseCase, LockCartForCheckoutUseCase } from '@modules/cart';
import {
  CustomerAddressesService,
  CustomerProfilesService,
} from '@modules/customers';
import {
  CreateOrderUseCase,
  FindCustomerOrderUseCase,
  TransitionOrderUseCase,
  orderTypeOf,
  type NewOrder,
  type Order,
  type OrderAddressSnapshot,
  type OrderPickupSnapshot,
} from '@modules/orders';
import { CapacityService, SchedulingService } from '@modules/scheduling';
import { VendorDirectory } from '@modules/vendors';
import { assertLinesOrderable } from '../domain/assert-lines-orderable';
import { assertMethodSupported } from '../domain/assert-method-supported';
import { assertMinimumReached } from '../domain/assert-minimum-reached';
import { assertOrderingOpen } from '../domain/assert-ordering-open';
import type { CheckoutCart } from '../domain/checkout-cart.type';
import { paymentMethodsFor } from '../domain/payment-methods-for';
import type { PlaceOrderRequest } from '../domain/place-order-request.type';
import {
  CHECKOUT_SETTINGS,
  type CheckoutSettings,
} from '../domain/ports/checkout-settings.port';
import { PLACE_ORDER_OPERATION } from './place-order-operation.constants';
import type { PlacedOrderOutcome } from './placed-order-outcome.type';
import { toCheckoutCart } from './to-checkout-cart';
import { toOrderLine } from './to-order-line';

/**
 * Turns the customer's cart into an order (POST /v1/customer/orders, ORD-API-1), cash
 * on delivery only, in one transaction keyed by `Idempotency-Key`:
 *
 * - **The key.** Kept per customer with a hash of the request body
 *   (`IdempotencyRunner.runOnce`). The same key and body answer the first order again,
 *   whatever the cart is now; the same key with another body is IDEMPOTENCY_KEY_REUSED;
 *   two requests at once with one key make one order. A refusal keeps nothing.
 * - **The locks, in this order:** the user row of the customer first (UNAUTHORIZED for
 *   a deleted account, ACCOUNT_DISABLED for a disabled one, for pickup as for delivery;
 *   account deletion takes the same lock first), then the cart row.
 * - **The cart.** ORDERING_PAUSED; the cart read again under its lock
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
 * - **The order** is made by `CreateOrderUseCase` with snapshots of everything. When
 *   COD is configured for auto-confirmation, `TransitionOrderUseCase` moves it from
 *   `new` to `confirmed` as the system in this same transaction. The cart is emptied,
 *   and both order events are delivered after the commit.
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
    private readonly profiles: Pick<
      CustomerProfilesService,
      'profileOf' | 'lockAccount'
    >,
    @Inject(CustomerAddressesService)
    private readonly addresses: Pick<CustomerAddressesService, 'get'>,
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
    @Inject(TransitionOrderUseCase)
    private readonly transitionOrder: Pick<TransitionOrderUseCase, 'execute'>,
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
      const stored = await this.idempotency.runOnce<PlacedOrderOutcome>(
        PLACE_ORDER_OPERATION,
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
  ): Promise<PlacedOrderOutcome> {
    assertOrderingOpen(await this.settings.pause());
    // The user row before the cart row: account deletion locks the user, then deletes
    // the cart under it, so the other order could deadlock.
    const { phone } = await this.profiles.lockAccount(userId);
    const cart = await this.carts.execute(userId);
    if (cart.vendorId === null || cart.lines.length === 0) {
      throw new AppError(ErrorCode.CART_EMPTY);
    }
    const { fullName } = await this.profiles.profileOf(userId);
    if (fullName === null) {
      throw new AppError(ErrorCode.PROFILE_INCOMPLETE);
    }
    assertLinesOrderable(cart.issues);
    assertMinimumReached(cart.minOrder, cart.minOrderRemaining);
    const { fulfilment } = cart;
    if (fulfilment === null) {
      throw new AppError(ErrorCode.FULFILMENT_REQUIRED);
    }
    const checkoutCart = toCheckoutCart(cart);
    const vendorId = assertMethodSupported(checkoutCart, fulfilment.method);
    const address =
      fulfilment.method === 'delivery'
        ? await this.addressOf(userId, fulfilment.addressId)
        : null;
    const day = await this.scheduling.assertDayAvailable(
      { vendorId, method: fulfilment.method, orderTypes: cart.orderTypes },
      fulfilment.date,
    );
    const codRules = await this.assertPaymentAllowed(checkoutCart, request);
    const [store, commission] = await Promise.all([
      this.vendors.storeOf(vendorId),
      this.vendors.commissionBasisPointsOf(vendorId),
    ]);
    if (store === null || commission === null) {
      throw new AppError(ErrorCode.ITEM_UNAVAILABLE, {
        details: { lineIds: cart.lines.map((line) => line.id) },
      });
    }
    const pickupPoint: OrderPickupSnapshot | null =
      fulfilment.method === 'pickup'
        ? (await this.scheduling.pickupTerms(vendorId)).point
        : null;
    // ASSUMPTION (DECISIONS.md, "Every cart order is ready_meat in Sprint 3"): no
    // carcasses are counted until products have an order type.
    const carcasses = 0;
    await this.capacity.reserve({
      vendorId,
      date: fulfilment.date,
      carcasses,
    });
    const order = await this.createOrder.execute({
      userId,
      customer: { name: fullName, phone },
      vendorId,
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
      savedAddressId:
        fulfilment.method === 'delivery' ? fulfilment.addressId : null,
      address,
      pickupPoint,
      deliveryFee: cart.deliveryFee,
      paymentMethod: 'cod',
      notes: request.notes ?? null,
      carcasses,
    } satisfies NewOrder);
    if (codRules.autoConfirm) {
      await this.transitionOrder.execute(order.id, 'confirmed', {
        type: 'system',
        id: null,
      });
    }
    await this.clearCart.execute(userId);
    return { orderId: order.id, bodyHash };
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
    cart: CheckoutCart,
    request: PlaceOrderRequest,
  ): Promise<Awaited<ReturnType<CheckoutSettings['cod']>>> {
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
    const codRules = await this.settings.cod();
    const offered = paymentMethodsFor(cart, codRules);
    if (!offered.some((option) => option.method === 'cod')) {
      throw new AppError(ErrorCode.PAYMENT_METHOD_NOT_AVAILABLE, {
        details: { method: 'cod' },
      });
    }
    return codRules;
  }
}

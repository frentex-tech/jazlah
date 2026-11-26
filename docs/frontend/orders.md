# Cart, checkout, payments and orders (Sprint 3)

The Sprint 3 contract: the cart, the days, placing an order, paying, the order shape, the operations settings, coupons and the wallet. Every route below is in `openapi.json` now. **Until its task lands, a route answers NOT_IMPLEMENTED (501) with `details.task`** (the task key), so build against the shapes and show "coming soon" on 501. Each task keeps the shape it ships with; a change would come with a note here.

Money is integer halalas with VAT included. Days are Riyadh `yyyy-MM-dd`, times of day Riyadh `HH:mm`, instants ISO UTC.

## Routes, and the task that builds each

| Route | Task |
|---|---|
| `GET /v1/public/settings/client`, `GET /v1/admin/settings/operations`, `PATCH /v1/admin/settings/operations`, `PUT /v1/admin/settings/operations/pause` | SCH-API-1 (**live**: real answers, same shapes) |
| `GET /v1/customer/cart`, `DELETE /v1/customer/cart`, `POST /v1/customer/cart/items`, `PATCH /v1/customer/cart/items/{id}`, `DELETE /v1/customer/cart/items/{id}` | CRT-API-1 (**live**: real answers, same shapes; `coupon` and `fulfilment` stay null until CRT-API-3 and SCH-API-2) |
| `POST /v1/customer/cart/merge` | CRT-API-1, after November 30 (still 501) |
| `PATCH /v1/customer/cart/fulfilment`, `GET /v1/customer/checkout/days`, `GET /v1/admin/vendors/{id}/capacity`, `PUT /v1/admin/vendors/{id}/capacity`, `PUT /v1/admin/vendors/{id}/capacity/{date}`, `DELETE /v1/admin/vendors/{id}/capacity/{date}` | SCH-API-2 |
| `GET /v1/customer/wallet`, `GET /v1/customer/wallet/transactions`, `GET /v1/admin/customers/{id}/wallet`, `POST /v1/admin/customers/{id}/wallet/adjustments` | WAL-API-1 |
| `GET /v1/customer/checkout/payment-methods`, `POST /v1/customer/orders/{id}/payments` (tag Customer checkout), `POST /v1/webhooks/payments/{provider}` | PAY-API-1 |
| `POST /v1/customer/orders` | ORD-API-1 |
| `POST /v1/vendor/orders/{id}/transition`, `POST /v1/admin/orders/{id}/transition` | ORD-API-2 |
| `GET /v1/customer/orders`, `GET /v1/customer/orders/{id}`, `GET /v1/vendor/orders`, `GET /v1/vendor/orders/{id}`, `GET /v1/admin/orders`, `GET /v1/admin/orders/{id}` | ORD-API-3 |
| `POST /v1/customer/cart/coupon`, `DELETE /v1/customer/cart/coupon`, `GET /v1/admin/coupons`, `POST /v1/admin/coupons`, `GET /v1/admin/coupons/{id}`, `PATCH /v1/admin/coupons/{id}`, `GET /v1/admin/coupons/{id}/usage` | CRT-API-3 |

Not in Sprint 3: the customer's cancel (CAN-API-1, Sprint 4), the admin's cancel with a refund choice and the reschedule (Sprint 4). Rejecting a cash-on-delivery order is a move: `POST /v1/admin/orders/{id}/transition` with `{ "to": "cancelled", "note": "<reason>" }`.

## The order: one shape for every app

`OrderResponseDto` is the same for the customer app and the dashboard; lists use `OrderSummaryResponseDto` (its first fields).

- **Number** `JZ-YYMMDD-XXXX`: the Riyadh date it was placed and a 4-digit sequence of that day.
- **Status:** `pending_payment`, `new` (cash on delivery waiting for review), `confirmed`, `preparing`, `ready`, `picked_up`, `out_for_delivery`, `delivered`, `collected` (pickup), `cancelled`, `delivery_failed`, `returned`.
- **Moves:** never work them out in the app. Each order answers `allowedTransitions` for the caller; send one of them to `…/transition`.
- **Money:** `subtotalHalalas`, `discountHalalas` (never on the delivery fee), `deliveryFeeHalalas`, `totalHalalas`, `vatHalalas` (round half up of total × 15 / 115).
- **Lines** (`items`): `name`, `imageUrl`, `size { id, approxWeightGrams, tag }`, `cutting { id, name } | null`, `packaging` (the enum value: `trays`, `bags`, `vacuum`, `none`; names are the app's), `exclusions [{ id, name }]`, `notes`, `quantity`, `unitPriceHalalas`, `totalHalalas`. Names are as when ordered.
- **Where:** `address` (the saved address's fields, copied when placed) for delivery, `pickupPoint { name, address, location, phone, hours }` for pickup; `window` is the delivery window (null for pickup).
- **The store:** `vendor { id, name, phone, location, city }`: the customer's "call the store" and directions.
- **Payment:** `payment { method, status, paymentId, walletHalalas, walletRestoredHalalas, cardLast4 }`; `expiresAt` while unpaid.
- **The customer:** `customer { id, name, phone }`; the phone is in full for admins and masked for the vendor.
- **History:** `history [{ from, to, actorType, note, at }]`, oldest first. `refunds` is empty until Sprint 4.

## Paying

- Place with `POST /v1/customer/orders`, header **`Idempotency-Key`** (a UUID made once per attempt; send it again on a retry of that attempt and the first success is answered again). A refusal is not kept: fix it and send the same key.
- The answer is `{ order, payment }`. When `payment.nextAction` is not null, open **`nextAction.redirectUrl`** (the provider's hosted page; on staging the fake provider's approve or decline page) in a web view; close it when it reaches **`nextAction.returnUrl`** (match scheme, host and path). **The result always comes from the server:** poll `GET /v1/customer/orders/{id}` every 2 s up to 60 s; paid once the status is neither `pending_payment` nor `cancelled`.
- `payment` is null for cash on delivery and wallet only (no payment record is made); `nextAction` is also null on any later read: read the order, not the payment.
- **One open payment per order.** `POST /v1/customer/orders/{id}/payments` with the same method while the latest is still `initiated` answers that payment again; another method gets PAYMENT_IN_PROGRESS (`details.paymentId`). An `initiated` payment ends when the provider reports it or **10 minutes** after it started, so the customer can still switch method (to cash on delivery, say) before the order expires. A second capture is refunded in full and alerted.
- **Wallet:** `walletAmountHalalas` pays part with another method (0 to less than the total); with `paymentMethod: wallet` leave it out: the whole total is taken and the order is confirmed at once. Paying again sends `paymentMethod` too. If the online part fails, the wallet part comes back at once (`walletRestoredHalalas`) and the next attempt charges the whole total. Cash on delivery can take a wallet part too.
- **Unpaid for 15 minutes** (`expiresAt`): cancelled, giving back the day's capacity, the coupon and the wallet part. Workers are off on staging, so this happens when the order is read or moved; until then, the days, coupon limits and the wallet balance already count it as released. Webhooks are processed at once.
- Cash on delivery lands as `new` (review) or `confirmed` (auto), from the settings.

## The cart

- One store per cart: another store's product is CART_VENDOR_MISMATCH (`details.vendorName`) until sent again with `replaceCart: true`.
- The ids it takes: `sizeId` (`sizes[].id`), `cuttingStyleId` (`cuttings[].cuttingStyleId`), `packaging` (the enum value), `exclusionItemIds` (`exclusions[].id`). Refusals follow the catalog's price function, in its order (see [catalog.md](catalog.md)).
- `issues` on a line block checkout: `PRICE_CHANGED` (PATCH the line with the same quantity to accept) and `ITEM_UNAVAILABLE` (remove it). A coupon that stopped applying is simply absent.
- Minimum order: compared with the subtotal before the discount; `minOrderRemainingHalalas`; `canCheckout`.
- Guest merge after sign-in: `POST /v1/customer/cart/merge` with a `mergeId` made once per guest cart; repeating it answers the first result.

## Days, settings and capacity

- `GET /v1/customer/checkout/days?method=` answers every day of the horizon from today (14 days: today to today + 13), each `isAvailable` or with `reason` (`PAST_CUTOFF`, `CLOSED`, `FULL`, `OUTSIDE_HORIZON`, `VENDOR_CLOSED`) and its `window`. It does not take an address: coverage is checked when the fulfilment is saved (ADDRESS_NOT_COVERED).
- Pickup hours: the chosen day's (`pickupPoint.hours`, and each day's `window`). The vendor's weekly hours are not in this contract (an API gap, below).
- Settings: `PATCH /v1/admin/settings/operations` changes only the keys sent; the pause has its own route, `PUT /v1/admin/settings/operations/pause`. While paused, every cart change and checkout call answers ORDERING_PAUSED with the admin's message in `details`. The apps read `GET /v1/public/settings/client`.
- Capacity: a vendor's own daily limits (null: the platform's `defaultCapacity`) and one day's limits.

## Differences from the apps' mocks

Rename these when wiring; the document is the contract.

| Area | Mock | Contract |
|---|---|---|
| Order | `deliveryDate`, `addressSnapshot`, `pickupSnapshot`, `vatAmountHalalas` | `fulfilmentDate`, `address`, `pickupPoint`, `vatHalalas` |
| Order (mobile) | flat `vendorId`/`vendorName`, `walletAmount`, `paymentStatus`, no `*Halalas` | `vendor {…}`, `payment {…}`, `*Halalas` everywhere |
| Order lines | `size { name, weightGrams }`, `cut`, packaging name | `size { id, approxWeightGrams, tag }`, `cutting`, packaging enum |
| Refund | `to`, `at` | `destination`, `createdAt` |
| Cart | `replace`, `skipped`, `couponCode` | `replaceCart`, `skippedCount`, `coupon { code, discountHalalas }` |
| Payment methods | `options`, `available`, `tender` | `items`, `isAvailable`, `walletBalanceHalalas` |
| Days | `available` | `isAvailable` |
| Settings | `PUT` (partial), `capacity`, cut-off keys `ready_meat` | `PATCH`, `defaultCapacity`, keys `readyMeat`, `carcass`, `cooked`, `occasion`, `adha` |
| Coupon usage | `distinctUsers` | `distinctCustomers`; `firstOrderOnly` is not in the contract |
| Order list query | `method`, `date` | `paymentMethod`, `fulfilmentDate` |
| Status codes | `DAY_NOT_AVAILABLE`, `MIN_ORDER_NOT_MET` as the mocks answer | all 409 except a choice or a code that cannot work (options, method, address, coupon codes: 422); see [errors.md](errors.md) |
| Permission refusal | the mocks' own code | `PERMISSION_DENIED`, returned once ADM-API-1 (#111) adds permissions; no Sprint 3 route returns it yet |

## Not in this contract (API gaps)

- The vendor's weekly working hours (pickup's `VENDOR_CLOSED` uses them inside the API).
- Support contacts (phone, WhatsApp) in the client settings, instructions on the pickup point, saved cards on the payment methods, and `canComplain` (complaints are Sprint 5).
- The admin wallet credit takes an `Idempotency-Key` too: a double click credits once.
- Realtime events: `order.created` (the list row) and `order.updated` (`{ id, status }`) come with ORD-API-3 over the socket; until then, poll.
- A reschedule-days read and the Sprint 4 cancel, refund and reschedule routes.

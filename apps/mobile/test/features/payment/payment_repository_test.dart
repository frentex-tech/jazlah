import 'package:flutter_test/flutter_test.dart';
import 'package:jazlah/core/errors/api_error.dart';
import 'package:jazlah/core/geo/geo_point.dart';
import 'package:jazlah/features/addresses/data/address_repository.dart';
import 'package:jazlah/features/addresses/domain/address.dart';
import 'package:jazlah/features/cart/data/cart_repository.dart';
import 'package:jazlah/features/cart/domain/cart.dart';
import 'package:jazlah/features/checkout/data/checkout_repository.dart';
import 'package:jazlah/features/checkout/data/order_repository.dart';
import 'package:jazlah/features/checkout/domain/order.dart';
import 'package:jazlah/features/payment/data/payment_repository.dart';
import 'package:jazlah/features/payment/domain/payment_method.dart';
import 'package:jazlah/features/product/domain/product.dart';

import '../../helpers/cart_fakes.dart';

const _home = Address(id: 'a1', label: 'المنزل', point: GeoPoint(24.8, 46.6), isDefault: true, city: 'الرياض');

Matcher apiError(String code) => isA<ApiError>().having((e) => e.code, 'code', code);

late DateTime clock;
late MockOrderRepository orders;
late MockPaymentRepository payments;

/// A cart of 123.00 (108.00 + 15.00 delivery) with a wallet of [balance]; 13:00 Riyadh on 10 November 2026.
Future<void> setUpRepos({int balance = 5000, bool codAuto = false}) async {
  clock = DateTime.utc(2026, 11, 10, 10);
  final cart = MockCartRepository(delay: Duration.zero);
  await cart.add(kebab.withQuantity(3));
  cart.fulfilment = const FulfilmentChoice(method: Fulfilment.delivery, date: '2026-11-11', addressId: 'a1');
  final book = MockAddressRepository(seed: [_home]);
  final checkout = MockCheckoutRepository(cart, addresses: book, now: () => clock, delay: Duration.zero);
  orders = MockOrderRepository(
    cart,
    checkout,
    addresses: book,
    wallet: MockWallet(balance: balance),
    now: () => clock,
    codAutoConfirm: codAuto,
    delay: Duration.zero,
  );
  payments = MockPaymentRepository(cart, orders, delay: Duration.zero);
}

void main() {
  test('the fake provider approves: payment captured, order confirmed', () async {
    await setUpRepos();
    final placed = await orders.place(idempotencyKey: 'k', paymentMethod: PaymentMethodCode.mada);
    expect((await payments.status('o-1')).order.status, OrderStatus.pendingPayment);
    orders.decide(placed.nextAction!.paymentId, approve: true);
    final s = await payments.status('o-1');
    expect(s.order.status, OrderStatus.confirmed);
    expect(s.paymentStatus, PaymentStatus.captured);
  });

  test('declined, then retried on the same order with a new key', () async {
    await setUpRepos();
    final placed = await orders.place(idempotencyKey: 'k', paymentMethod: PaymentMethodCode.mada);
    orders.decide(placed.nextAction!.paymentId, approve: false);
    var s = await payments.status('o-1');
    expect(s.order.status, OrderStatus.pendingPayment);
    expect(s.paymentStatus, PaymentStatus.failed);
    final again = await payments.retry(orderId: 'o-1', method: PaymentMethodCode.applePay, idempotencyKey: 'p2');
    final same = await payments.retry(orderId: 'o-1', method: PaymentMethodCode.applePay, idempotencyKey: 'p2');
    expect(same.nextAction!.paymentId, again.nextAction!.paymentId); // one payment per key
    expect(again.nextAction!.paymentId, isNot(placed.nextAction!.paymentId));
    expect(orders.orders, hasLength(1));
    orders.decide(again.nextAction!.paymentId, approve: true);
    s = await payments.status('o-1');
    expect(s.order.status, OrderStatus.confirmed);
    expect(s.order.paymentMethod, PaymentMethodCode.applePay);
    await expectLater(
      payments.retry(orderId: 'o-1', method: PaymentMethodCode.mada, idempotencyKey: 'p3'),
      throwsA(apiError(PaymentError.orderNotPayable)),
    );
  });

  test('no second payment while one is open (a real gateway does not cancel it by itself)', () async {
    await setUpRepos();
    final placed = await orders.place(idempotencyKey: 'k', paymentMethod: PaymentMethodCode.mada);
    await expectLater(
      payments.retry(orderId: 'o-1', method: PaymentMethodCode.applePay, idempotencyKey: 'p2'),
      throwsA(apiError(PaymentError.paymentInProgress)),
    );
    orders.decide(placed.nextAction!.paymentId, approve: true); // the first one still captures
    expect((await payments.status('o-1')).order.status, OrderStatus.confirmed);
  });

  test('the next action is a redirect to the hosted page, which returns to the app', () async {
    await setUpRepos();
    final a = (await orders.place(idempotencyKey: 'k', paymentMethod: PaymentMethodCode.mada)).nextAction!;
    expect(a.type, PaymentAction.redirect);
    expect(a.url, '${MockOrderRepository.hostedBase}/${a.paymentId}');
    final back = orders.hostedPage(a.url, 'cancel')!;
    expect(isReturnUrl(back, a.returnUrl), isTrue);
    final s = await payments.status('o-1');
    expect(s.paymentStatus, PaymentStatus.cancelled);
    expect(s.order.status, OrderStatus.pendingPayment);
    // Cancelled: a new payment may start.
    final again = await payments.retry(orderId: 'o-1', method: PaymentMethodCode.mada, idempotencyKey: 'p2');
    expect(orders.hostedPage(again.nextAction!.url, 'approve'), startsWith(again.nextAction!.returnUrl));
    expect((await payments.status('o-1')).order.status, OrderStatus.confirmed);
    expect(orders.hostedPage('https://elsewhere.test/x', 'approve'), isNull);
  });

  test('return detection: same scheme, host and path, any query', () {
    const r = 'jazlah://checkout/pay/o-1/return';
    expect(isReturnUrl('$r?payment=pay-1&status=ok', r), isTrue);
    expect(isReturnUrl(r, r), isTrue);
    expect(isReturnUrl('jazlah://checkout/pay/o-2/return', r), isFalse);
    expect(isReturnUrl('https://checkout/pay/o-1/return', r), isFalse);
    expect(isReturnUrl('https://pay.mock.jazla.test/fake/pay-1', r), isFalse);
  });

  test('amounts ending in 13 halalas are declined by the fake provider', () async {
    await setUpRepos(balance: 1987); // 123.00 - 19.87 = 103.13 left for the card
    final placed = await orders.place(idempotencyKey: 'k', paymentMethod: PaymentMethodCode.mada, walletAmount: 1987);
    expect(placed.nextAction!.amount, 10313);
    orders.decide(placed.nextAction!.paymentId, approve: true);
    expect((await payments.status('o-1')).paymentStatus, PaymentStatus.failed);
  });

  test('wallet covers 100%: confirmed without the gateway, wallet debited', () async {
    await setUpRepos(balance: 20000);
    final placed = await orders.place(idempotencyKey: 'k', paymentMethod: PaymentMethodCode.wallet);
    expect(placed.nextAction, isNull);
    expect(placed.order.status, OrderStatus.confirmed);
    expect(placed.order.walletAmount, 12300);
    expect(orders.wallet.balance, 7700);
  });

  test('wallet part + a failed card: the wallet amount comes back', () async {
    await setUpRepos();
    final placed = await orders.place(idempotencyKey: 'k', paymentMethod: PaymentMethodCode.mada, walletAmount: 5000);
    expect(placed.nextAction!.amount, 7300);
    expect(orders.wallet.balance, 0);
    orders.decide(placed.nextAction!.paymentId, approve: false);
    final s = await payments.status('o-1');
    expect(orders.wallet.balance, 5000);
    expect(s.walletRestored, 5000);
    expect(s.order.walletAmount, 0);
    // The retry then charges the whole total.
    final again = await payments.retry(orderId: 'o-1', method: PaymentMethodCode.mada, idempotencyKey: 'p2');
    expect(again.nextAction!.amount, 12300);
  });

  test('a wallet part above the balance is refused', () async {
    await setUpRepos(balance: 1000);
    await expectLater(
      orders.place(idempotencyKey: 'k', paymentMethod: PaymentMethodCode.mada, walletAmount: 5000),
      throwsA(apiError(OrderError.walletInsufficient)),
    );
  });

  test('unpaid after 15 minutes (Riyadh clock): cancelled, wallet back, not payable', () async {
    await setUpRepos();
    final placed = await orders.place(idempotencyKey: 'k', paymentMethod: PaymentMethodCode.mada, walletAmount: 5000);
    clock = clock.add(const Duration(minutes: 14, seconds: 59));
    expect((await payments.status('o-1')).order.status, OrderStatus.pendingPayment);
    clock = clock.add(const Duration(seconds: 1));
    final s = await payments.status('o-1');
    expect(s.order.status, OrderStatus.cancelled);
    expect(s.paymentStatus, PaymentStatus.cancelled);
    expect(orders.wallet.balance, 5000);
    orders.decide(placed.nextAction!.paymentId, approve: true); // a late capture changes nothing
    expect((await payments.status('o-1')).order.status, OrderStatus.cancelled);
    await expectLater(
      payments.retry(orderId: 'o-1', method: PaymentMethodCode.mada, idempotencyKey: 'p2'),
      throwsA(apiError(PaymentError.orderNotPayable)),
    );
  });

  test('COD follows the confirmation setting', () async {
    await setUpRepos();
    expect(
      (await orders.place(idempotencyKey: 'k', paymentMethod: PaymentMethodCode.cod)).order.status,
      OrderStatus.created,
    );
    await setUpRepos(codAuto: true);
    expect(
      (await orders.place(idempotencyKey: 'k', paymentMethod: PaymentMethodCode.cod)).order.status,
      OrderStatus.confirmed,
    );
  });

  test("an order's methods: no tender plan, the wallet measured against what is left", () async {
    await setUpRepos(balance: 20000);
    expect((await payments.methods()).tender, isNull); // the wallet covers the cart: wallet only
    await orders.place(idempotencyKey: 'k', paymentMethod: PaymentMethodCode.mada);
    final m = await payments.methods(orderId: 'o-1');
    expect(m.tender, isNull);
    expect(m.options.firstWhere((o) => o.method == PaymentMethodCode.wallet).available, isTrue);
  });
}

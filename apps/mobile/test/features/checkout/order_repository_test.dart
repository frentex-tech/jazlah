import 'package:flutter_test/flutter_test.dart';
import 'package:jazlah/core/errors/api_error.dart';
import 'package:jazlah/core/geo/geo_point.dart';
import 'package:jazlah/features/addresses/data/address_repository.dart';
import 'package:jazlah/features/addresses/domain/address.dart';
import 'package:jazlah/features/cart/data/cart_repository.dart';
import 'package:jazlah/features/cart/domain/cart.dart';
import 'package:jazlah/features/checkout/data/checkout_repository.dart';
import 'package:jazlah/features/checkout/data/order_repository.dart';
import 'package:jazlah/features/checkout/domain/fulfilment.dart';
import 'package:jazlah/features/checkout/domain/order.dart';
import 'package:jazlah/features/payment/data/payment_repository.dart';
import 'package:jazlah/features/payment/domain/payment_method.dart';
import 'package:jazlah/features/product/domain/product.dart';

import '../../helpers/cart_fakes.dart';

Matcher apiError(String code) => isA<ApiError>().having((e) => e.code, 'code', code);

const _covered = Address(id: 'a1', label: 'المنزل', point: GeoPoint(24.8, 46.6), isDefault: true, city: 'الرياض');
const _farm = Address(id: 'a2', label: 'المزرعة', point: GeoPoint(26.3, 43.9), isDefault: false, covered: false);

/// 13:00 Riyadh on Tuesday 10 November 2026: Wednesday 11 is the first open day, Thursday 12 is full.
DateTime _now() => DateTime.utc(2026, 11, 10, 10);

late MockCartRepository cart;
late MockCheckoutRepository checkout;

Future<MockOrderRepository> _repo({
  int quantity = 3,
  String date = '2026-11-11',
  String addressId = 'a1',
  Fulfilment method = Fulfilment.delivery,
}) async {
  cart = MockCartRepository(delay: Duration.zero);
  await cart.add(kebab.withQuantity(quantity));
  cart.fulfilment = FulfilmentChoice(
    method: method,
    date: date,
    addressId: method == Fulfilment.delivery ? addressId : null,
  );
  final book = MockAddressRepository(seed: [_covered, _farm]);
  checkout = MockCheckoutRepository(cart, addresses: book, now: _now, delay: Duration.zero);
  return MockOrderRepository(cart, checkout, addresses: book, now: _now, delay: Duration.zero);
}

void main() {
  test('COD: a new order with snapshots, numbered in Riyadh, and the cart cleared', () async {
    final repo = await _repo();
    final placed = await repo.place(idempotencyKey: 'k1', paymentMethod: PaymentMethodCode.cod);
    final o = placed.order;
    expect(placed.nextAction, isNull);
    expect(o.status, OrderStatus.created);
    expect(o.number, 'JZ-261110-0001');
    expect(o.deliveryDate, '2026-11-11');
    expect(o.window.start, '16:00');
    expect(o.items.single.name.en, isNotEmpty);
    expect(o.items.single.quantity, 3);
    expect(o.items.single.lineTotal, 10800);
    expect(o.subtotal, 10800);
    expect(o.deliveryFee, 1500);
    expect(o.total, 12300);
    expect(o.addressSnapshot?.id, 'a1');
    final after = await cart.get();
    expect(after.lines, isEmpty);
    expect(after.fulfilment, isNull);
  });

  test('a gateway method: pending payment and a pay next action', () async {
    final repo = await _repo();
    final placed = await repo.place(idempotencyKey: 'k1', paymentMethod: PaymentMethodCode.mada);
    expect(placed.order.status, OrderStatus.pendingPayment);
    expect(placed.nextAction, PlacedOrder.pay);
  });

  test('the same key twice, even in parallel, creates one order', () async {
    final repo = await _repo();
    final results = await Future.wait([
      repo.place(idempotencyKey: 'k1', paymentMethod: PaymentMethodCode.cod),
      repo.place(idempotencyKey: 'k1', paymentMethod: PaymentMethodCode.cod),
    ]);
    final again = await repo.place(idempotencyKey: 'k1', paymentMethod: PaymentMethodCode.cod);
    expect(repo.orders, hasLength(1));
    expect({results[0].order.id, results[1].order.id, again.order.id}, {'o-1'});
  });

  test('a refusal saves nothing, and the same key may try again', () async {
    final repo = await _repo();
    checkout.paused = true;
    await expectLater(
      repo.place(idempotencyKey: 'k1', paymentMethod: PaymentMethodCode.cod),
      throwsA(apiError(FulfilmentError.orderingPaused)),
    );
    expect(repo.orders, isEmpty);
    checkout.paused = false;
    await repo.place(idempotencyKey: 'k1', paymentMethod: PaymentMethodCode.cod);
    expect(repo.orders, hasLength(1));
  });

  test('re-checks the day, coverage, minimum order and prices', () async {
    var repo = await _repo(date: '2026-11-12');
    await expectLater(
      repo.place(idempotencyKey: 'a', paymentMethod: 'cod'),
      throwsA(apiError(FulfilmentError.dayFull)),
    );
    repo = await _repo(addressId: 'a2');
    await expectLater(
      repo.place(idempotencyKey: 'b', paymentMethod: 'cod'),
      throwsA(apiError(FulfilmentError.addressNotCovered)),
    );
    repo = await _repo(quantity: 1);
    await expectLater(
      repo.place(idempotencyKey: 'c', paymentMethod: 'cod'),
      throwsA(apiError(OrderError.minOrderNotMet)),
    );
    repo = (await _repo())..changePriceNext = true;
    await expectLater(
      repo.place(idempotencyKey: 'd', paymentMethod: 'cod'),
      throwsA(apiError(OrderError.priceChanged)),
    );
    // The cart now shows the price banner and keeps its lines.
    final c = await cart.get();
    expect(c.issues.single.code, CartIssueCode.priceChanged);
    expect(repo.orders, isEmpty);
  });

  test('pickup: the pickup point is snapshotted, no address', () async {
    final repo = await _repo(method: Fulfilment.pickup);
    final o = (await repo.place(idempotencyKey: 'k', paymentMethod: 'cod')).order;
    expect(o.fulfilment, Fulfilment.pickup);
    expect(o.pickupSnapshot, isNotNull);
    expect(o.addressSnapshot, isNull);
  });

  test('idempotency keys are UUID v4 and differ', () {
    final a = newIdempotencyKey();
    expect(a, matches(RegExp(r'^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$')));
    expect(newIdempotencyKey(), isNot(a));
  });

  group('payment methods', () {
    Future<Map<String, PaymentMethodOption>> methods({
      int walletBalance = 5000,
      bool cod = true,
      int codMax = 100000,
    }) async {
      final c = MockCartRepository(delay: Duration.zero);
      await c.add(kebab.withQuantity(3)); // 108.00
      final list = await MockPaymentRepository(
        c,
        walletBalance: walletBalance,
        codEnabled: cod,
        codMax: codMax,
        delay: Duration.zero,
      ).methods();
      expect(list.tender, isNull);
      return {for (final m in list.options) m.method: m};
    }

    test('wallet below the total is disabled with its reason', () async {
      final m = await methods();
      expect(m[PaymentMethodCode.wallet]!.available, isFalse);
      expect(m[PaymentMethodCode.wallet]!.reason, PaymentMethodReason.walletInsufficient);
      expect((await methods(walletBalance: 20000))[PaymentMethodCode.wallet]!.available, isTrue);
    });

    test('COD is left out above the cap and when switched off', () async {
      expect((await methods())[PaymentMethodCode.cod]!.available, isTrue);
      expect((await methods(codMax: 5000)).containsKey(PaymentMethodCode.cod), isFalse);
      expect((await methods(cod: false)).containsKey(PaymentMethodCode.cod), isFalse);
    });
  });
}

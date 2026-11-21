import 'package:flutter_test/flutter_test.dart';
import 'package:jazlah/core/errors/api_error.dart';
import 'package:jazlah/features/addresses/data/address_repository.dart';
import 'package:jazlah/features/cart/data/cart_repository.dart';
import 'package:jazlah/features/cart/domain/cart.dart';
import 'package:jazlah/features/checkout/data/checkout_repository.dart';
import 'package:jazlah/features/checkout/domain/fulfilment.dart';
import 'package:jazlah/features/product/domain/product.dart';

import '../../helpers/cart_fakes.dart';

const carcass = CartItemInput(productId: 'p-falah-naimi-whole', sizeId: 'sz-small', cutId: 'cut-whole');

/// A Riyadh wall-clock time on Tuesday 10 November 2026 (UTC+3).
DateTime Function() riyadh(int hour, int minute, {int day = 10}) =>
    () => DateTime.utc(2026, 11, day, hour - 3, minute);

Matcher apiError(String code) => isA<ApiError>().having((e) => e.code, 'code', code);

Future<MockCheckoutRepository> repo(
  List<CartItemInput> items, {
  required DateTime Function() now,
  Map<int, Fulfilment?> closed = const {},
  Set<int> full = const {},
  Set<int> pickupClosedWeekdays = const {},
  ProductLookup? products,
}) async {
  final cart = MockCartRepository(delay: Duration.zero, products: products);
  for (final i in items) {
    await cart.add(i);
  }
  return MockCheckoutRepository(
    cart,
    addresses: MockAddressRepository(),
    now: now,
    closed: closed,
    full: full,
    pickupClosedWeekdays: pickupClosedWeekdays,
    delay: Duration.zero,
  );
}

Map<String, String?> reasons(List<CheckoutDay> days) => {for (final d in days) d.date: d.reason};

void main() {
  group('cutoff (Riyadh time)', () {
    test('ready meat: 11:59 still books today, 12:01 starts tomorrow', () async {
      var days = await (await repo([kebab], now: riyadh(11, 59))).days(Fulfilment.delivery);
      expect(days.first.date, '2026-11-10');
      expect(days.first.available, isTrue);

      days = await (await repo([kebab], now: riyadh(12, 1))).days(Fulfilment.delivery);
      expect(days.first.reason, DayReason.pastCutoff);
      expect(days[1].available, isTrue);
    });

    test('today is the Riyadh date, not the UTC one', () async {
      // 21:30 UTC on the 10th is 00:30 on the 11th in Riyadh.
      final days = await (await repo([kebab], now: () => DateTime.utc(2026, 11, 10, 21, 30))).days(Fulfilment.delivery);
      expect(days.first.date, '2026-11-11');
      expect(days.first.available, isTrue);
    });

    test('a mixed cart takes the strictest type (carcass: one day ahead, 20:00)', () async {
      var days = await (await repo([kebab, carcass], now: riyadh(10, 0))).days(Fulfilment.delivery);
      expect(days.first.reason, DayReason.pastCutoff);
      expect(days[1].available, isTrue);

      days = await (await repo([kebab, carcass], now: riyadh(20, 1))).days(Fulfilment.delivery);
      expect([for (final d in days.take(3)) d.reason], [DayReason.pastCutoff, DayReason.pastCutoff, null]);
    });
  });

  test('14-day horizon: the last day is bookable, the next is OUTSIDE_HORIZON', () async {
    final days = await (await repo([kebab], now: riyadh(9, 0))).days(Fulfilment.delivery);
    expect(days, hasLength(15));
    expect(days[13].date, '2026-11-23');
    expect(days[13].available, isTrue);
    expect(days[14].reason, DayReason.outsideHorizon);
    expect(days.every((d) => d.window.start == '16:00' && d.window.end == '22:00'), isTrue);
  });

  test('a delivery-only closed day stays open for pickup; a closed day for both closes both', () async {
    final r = await repo([kebab], now: riyadh(9, 0), closed: {3: null, 5: Fulfilment.delivery});
    final delivery = reasons(await r.days(Fulfilment.delivery));
    final pickup = reasons(await r.days(Fulfilment.pickup));
    expect(delivery['2026-11-15'], DayReason.closed);
    expect(pickup['2026-11-15'], isNull);
    expect(delivery['2026-11-13'], DayReason.closed);
    expect(pickup['2026-11-13'], DayReason.closed);
  });

  test("pickup skips the store's closed weekday (VENDOR_CLOSED); delivery does not", () async {
    final r = await repo([kebab], now: riyadh(9, 0), pickupClosedWeekdays: {DateTime.friday});
    expect(reasons(await r.days(Fulfilment.pickup))['2026-11-13'], DayReason.vendorClosed);
    expect(reasons(await r.days(Fulfilment.delivery))['2026-11-13'], isNull);
  });

  test('a full day is FULL and saving it answers DAY_FULL', () async {
    final r = await repo([kebab.withQuantity(3)], now: riyadh(9, 0), full: {2});
    expect(reasons(await r.days(Fulfilment.delivery))['2026-11-12'], DayReason.full);
    await expectLater(
      r.save(const FulfilmentChoice(method: Fulfilment.delivery, date: '2026-11-12', addressId: 'a1')),
      throwsA(apiError(FulfilmentError.dayFull)),
    );
  });

  group('fulfilment rules', () {
    test('a delivery-only store cannot be picked up: FULFILMENT_NOT_SUPPORTED', () async {
      final r = await repo([
        const CartItemInput(productId: 'p-waha-chicken-breast', sizeId: 'sz-500g', cutId: 'cut-whole'),
      ], now: riyadh(9, 0));
      await expectLater(r.days(Fulfilment.pickup), throwsA(apiError(FulfilmentError.notSupported)));
      expect(await r.days(Fulfilment.delivery), hasLength(15));
    });

    test('a pickup-only product cannot be delivered', () async {
      Future<ProductDetail?> pickupOnly(String id) async {
        final p = (await MockCartRepository.catalogProduct(id))!;
        return ProductDetail(
          id: p.id,
          vendorId: p.vendorId,
          name: p.name,
          images: p.images,
          sizes: p.sizes,
          cuts: p.cuts,
          packagings: p.packagings,
          exclusions: p.exclusions,
          available: p.available,
          fulfilment: Fulfilment.pickup,
        );
      }

      final r = await repo([kebab], now: riyadh(9, 0), products: pickupOnly);
      await expectLater(r.days(Fulfilment.delivery), throwsA(apiError(FulfilmentError.notSupported)));
      expect(await r.days(Fulfilment.pickup), isNotEmpty);
    });

    test('an address outside coverage: ADDRESS_NOT_COVERED', () async {
      final r = await repo([kebab.withQuantity(3)], now: riyadh(9, 0));
      await expectLater(
        r.save(const FulfilmentChoice(method: Fulfilment.delivery, date: '2026-11-10', addressId: 'a4')),
        throwsA(apiError(FulfilmentError.addressNotCovered)),
      );
    });

    test('paused: the admin message, and saving answers ORDERING_PAUSED', () async {
      final r = (await repo([kebab], now: riyadh(9, 0)))..paused = true;
      final pause = await r.pause();
      expect(pause.isPaused, isTrue);
      expect(pause.message('ar'), isNotEmpty);
      expect(pause.message('en'), isNotEmpty);
      await expectLater(
        r.save(const FulfilmentChoice(method: Fulfilment.pickup, date: '2026-11-10')),
        throwsA(apiError(FulfilmentError.orderingPaused)),
      );
    });

    test('a valid delivery is saved on the cart, which then counts the delivery fee', () async {
      final r = await repo([kebab.withQuantity(3)], now: riyadh(9, 0));
      final cart = await r.save(
        const FulfilmentChoice(method: Fulfilment.delivery, date: '2026-11-11', addressId: 'a1'),
      );
      expect(cart.fulfilment?.date, '2026-11-11');
      expect(cart.deliveryFee, 1500);
      expect(cart.total, 10800 + 1500);
    });

    test('pickup carries the store pickup point and no delivery fee', () async {
      final r = await repo([kebab.withQuantity(3)], now: riyadh(9, 0));
      final cart = await r.save(const FulfilmentChoice(method: Fulfilment.pickup, date: '2026-11-11'));
      expect(cart.pickup?.opensAt, '09:00');
      expect(cart.deliveryFee, 0);
    });
  });
}

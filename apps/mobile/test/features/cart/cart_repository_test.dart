import 'package:flutter_test/flutter_test.dart';
import 'package:jazlah/core/errors/api_error.dart';
import 'package:jazlah/core/storage/prefs.dart';
import 'package:jazlah/features/cart/data/cart_repository.dart';
import 'package:jazlah/features/cart/domain/cart.dart';
import 'package:jazlah/features/product/domain/product.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../../helpers/cart_fakes.dart';

MockCartRepository mock({ProductLookup? products}) => MockCartRepository(delay: Duration.zero, products: products);

Matcher apiError(String code) => isA<ApiError>().having((e) => e.code, 'code', code);

void main() {
  group('totals', () {
    test('subtotal, VAT included, minimum order and checkout', () async {
      final r = mock();
      var cart = await r.add(kebab.withQuantity(2));
      expect(cart.subtotal, 7200);
      expect(cart.total, 7200);
      expect(cart.vatIncluded, 939); // 72.00 × 15 / 115 = 9.391…
      expect(cart.minOrder, 10000);
      expect(cart.minOrderRemaining, 2800);
      expect(cart.canCheckout, isFalse);
      expect(cart.deliveryFee, 0);

      cart = await r.update(cart.lines.single.id, 3);
      expect(cart.subtotal, 10800);
      expect(cart.minOrderRemaining, 0);
      expect(cart.canCheckout, isTrue);
    });

    test('the delivery fee counts only once fulfilment = delivery', () async {
      final r = mock()..fulfilment = const FulfilmentChoice(method: Fulfilment.delivery, date: '2026-11-11');
      final cart = await r.add(kebab.withQuantity(3));
      expect(cart.deliveryFee, 1500);
      expect(cart.total, 10800 + 1500);
      expect(cart.vatIncluded, (12300 * 15 + 57) ~/ 115);
    });

    test('the same choices sum into one line; other notes make another line', () async {
      final r = mock();
      await r.add(kebab);
      var cart = await r.add(kebab.withQuantity(2));
      expect(cart.lines.single.item.quantity, 3);
      cart = await r.add(
        const CartItemInput(productId: 'p-falah-lamb-kebab', sizeId: 'sz-500g', notes: 'extra spicy'),
      );
      expect(cart.lines, hasLength(2));
    });
  });

  group('single store', () {
    test('another store → CART_VENDOR_MISMATCH; with replace the cart is replaced', () async {
      final r = mock();
      await r.add(kebab);
      await expectLater(r.add(otherStore), throwsA(apiError(CartError.vendorMismatch)));
      expect((await r.get()).lines.single.item.productId, kebab.productId);

      final cart = await r.add(otherStore, replace: true);
      expect(cart.lines.single.item.productId, otherStore.productId);
      expect(cart.vendorId, 'v-nukhba');
    });

    test('a line the product refuses is not added (missing cut)', () async {
      await expectLater(
        mock().add(const CartItemInput(productId: 'p-falah-ribeye', sizeId: 'sz-500g')),
        throwsA(apiError('OPTION_REQUIRED')),
      );
    });
  });

  group('issues', () {
    test('a price change is flagged until the line takes the new price', () async {
      var price = 3600;
      Future<ProductDetail?> products(String id) async {
        final p = await MockCartRepository.catalogProduct(id);
        return ProductDetail(
          id: p!.id,
          vendorId: p.vendorId,
          name: p.name,
          sizes: [ProductSize(id: 'sz-500g', grams: 500, priceHalalas: price)],
        );
      }

      final r = mock(products: products);
      final added = await r.add(kebab.withQuantity(2));
      price = 4000;
      var cart = await r.get();
      final issue = cart.issues.single;
      expect(issue.code, CartIssueCode.priceChanged);
      expect((issue.oldUnitPrice, issue.newUnitPrice), (3600, 4000));
      expect(cart.subtotal, 8000); // re-priced on every read
      expect(cart.canCheckout, isFalse);

      cart = await r.update(added.lines.single.id, 3);
      expect(cart.issues, isEmpty);
      expect(cart.canCheckout, isTrue);
    });

    test('an unavailable product is kept, not counted, and blocks checkout', () async {
      var gone = false;
      final r = mock(products: (id) async => gone ? null : MockCartRepository.catalogProduct(id));
      await r.add(kebab.withQuantity(4));
      gone = true;
      final cart = await r.get();
      expect(cart.lines.single.available, isFalse);
      expect(cart.issues.single.code, CartIssueCode.unavailable);
      expect(cart.subtotal, 0);
      expect(cart.canCheckout, isFalse);
    });
  });

  group('coupons', () {
    test('JAZLA10 takes 10% off the subtotal, any case', () async {
      final r = mock();
      await r.add(kebab.withQuantity(3));
      final cart = await r.applyCoupon(' jazla10 ');
      expect(cart.couponCode, 'JAZLA10');
      expect(cart.discount, 1080);
      expect(cart.total, 10800 - 1080);
      expect((await r.removeCoupon()).discount, 0);
    });

    test('each error code', () async {
      final r = mock();
      await r.add(otherStore);
      for (final (code, error) in [
        ('NOPE', CartError.couponNotFound),
        ('EID25', CartError.couponExpired),
        ('BIG50', CartError.couponMinOrder),
        ('FALAH15', CartError.couponNotApplicable),
        ('WELCOME5', CartError.couponLimitReached),
      ]) {
        await expectLater(r.applyCoupon(code), throwsA(apiError(error)), reason: code);
      }
    });
  });

  group('merge on sign-in', () {
    test('empty account cart: the guest lines move over', () async {
      final result = await mock().merge([kebab, kebab.withQuantity(2)]);
      expect(result.cart.lines.single.item.quantity, 3);
      expect(result.replacedPreviousCart, isFalse);
    });

    test('same store: same choices sum, others are added', () async {
      final r = mock();
      await r.add(kebab);
      final result = await r.merge([
        kebab.withQuantity(2),
        const CartItemInput(productId: 'p-falah-lamb-kebab', sizeId: 'sz-1kg'),
      ]);
      expect([for (final l in result.cart.lines) (l.item.sizeId, l.item.quantity)], [('sz-500g', 3), ('sz-1kg', 1)]);
      expect(result.replacedPreviousCart, isFalse);
    });

    test('another store: the guest cart wins and says so; invalid lines are skipped', () async {
      final r = mock();
      await r.add(kebab);
      await r.add(kebab.withQuantity(2));
      final result = await r.merge([
        otherStore,
        const CartItemInput(productId: 'p-gone', sizeId: 'sz-500g'),
        const CartItemInput(productId: 'p-nukhba-ribeye', sizeId: 'sz-500g'), // no cut
      ]);
      expect(result.replacedPreviousCart, isTrue);
      expect(result.skipped, 2);
      expect(result.cart.lines.single.item.productId, otherStore.productId);
    });
  });

  test('the device cart survives a restart and keeps the one-store rule', () async {
    SharedPreferences.setMockInitialValues({});
    final prefs = await Prefs.load();
    LocalCartRepository local() => LocalCartRepository(prefs, MockCartRepository.catalogProduct);
    await local().add(kebab.withQuantity(2));
    final cart = await local().get();
    expect(cart.onDevice, isTrue);
    expect(cart.count, 2);
    expect(cart.minOrder, isNull); // unknown without settings: hidden, no checkout
    expect(cart.canCheckout, isFalse);
    await expectLater(local().add(otherStore), throwsA(apiError(CartError.vendorMismatch)));
    await prefs.clearAccountData();
    expect(local().items, isEmpty);
  });
}

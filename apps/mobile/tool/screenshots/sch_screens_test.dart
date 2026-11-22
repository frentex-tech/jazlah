import 'package:flutter_test/flutter_test.dart';
import 'package:jazlah/app/providers.dart';
import 'package:jazlah/core/errors/api_error.dart';
import 'package:jazlah/core/geo/geo_point.dart';
import 'package:jazlah/core/storage/token_storage.dart';
import 'package:jazlah/features/addresses/data/address_repository.dart';
import 'package:jazlah/features/addresses/domain/address.dart';
import 'package:jazlah/features/addresses/presentation/address_providers.dart';
import 'package:jazlah/features/auth/data/auth_repository.dart';
import 'package:jazlah/features/auth/presentation/session_controller.dart';
import 'package:jazlah/features/cart/data/cart_repository.dart';
import 'package:jazlah/features/cart/domain/cart.dart';
import 'package:jazlah/features/cart/presentation/cart_providers.dart';
import 'package:jazlah/features/checkout/data/checkout_repository.dart';
import 'package:jazlah/features/checkout/domain/fulfilment.dart';
import 'package:jazlah/features/checkout/presentation/checkout_providers.dart';
import 'package:jazlah/features/checkout/presentation/checkout_screen.dart';
import 'package:jazlah/features/product/data/mock_product_repository.dart';
import 'package:jazlah/features/product/domain/product.dart';
import 'package:jazlah/features/product/presentation/product_providers.dart';

import '../../test/helpers/fakes.dart';
import 'harness.dart';

/// Figma's addresses: home in Al Malqa (covered) and the farm in Buraydah (outside coverage).
const _home = Address(
  id: 'a1',
  label: 'المنزل',
  point: GeoPoint(24.8168, 46.6195),
  isDefault: true,
  city: 'الرياض',
  district: 'حي الملقا',
  street: 'طريق أنس بن مالك',
);
const _farm = Address(
  id: 'a2',
  label: 'المزرعة',
  point: GeoPoint(26.33, 43.97),
  isDefault: false,
  city: 'بريدة',
  district: 'طريق القصيم',
  covered: false,
);

class _HangingAddresses extends MockAddressRepository {
  @override
  Future<List<Address>> list() => hang();
}

class _FailingDays extends MockCheckoutRepository {
  _FailingDays(super.cart, {required super.addresses, super.now}) : super(delay: Duration.zero);

  @override
  Future<List<CheckoutDay>> days(Fulfilment method) => Future.error(const ApiError(code: ApiError.network));
}

/// Tuesday 10 November 2026, 13:00 Riyadh: today is past the ready-meat cutoff, like Figma.
DateTime _now() => DateTime.utc(2026, 11, 10, 10);

Future<List<dynamic>> _o({
  AddressRepository? addresses,
  bool paused = false,
  bool failDays = false,
}) async {
  final tokens = MemoryTokens(const AuthTokens(accessToken: 'a', refreshToken: 'r'));
  final cart = MockCartRepository(delay: Duration.zero);
  await cart.add(const CartItemInput(productId: 'p-falah-ribeye', sizeId: 'sz-1kg', cutId: 'cut-slices', quantity: 2));
  final book = addresses ?? MockAddressRepository(seed: [_home, _farm]);
  return [
    tokenStorageProvider.overrideWithValue(tokens),
    authRepositoryProvider.overrideWithValue(MockAuthRepository(tokens)),
    productRepositoryProvider.overrideWithValue(MockProductRepository(delay: Duration.zero)),
    cartRepositoryProvider.overrideWithValue(cart),
    cartSettingsProvider.overrideWithValue(MockCartRepository.opsSettings),
    addressRepositoryProvider.overrideWithValue(book),
    checkoutRepositoryProvider.overrideWithValue(
      failDays
          ? _FailingDays(cart, addresses: book, now: _now)
          : MockCheckoutRepository(cart, addresses: book, now: _now, paused: paused, delay: Duration.zero),
    ),
  ];
}

void main() {
  setUpAll(loadFonts);

  testWidgets('checkout step 1', (t) async {
    Future<void> tap(WidgetTester t, String text) async {
      await t.pump(const Duration(milliseconds: 100)); // the days arrive after the addresses
      await t.tap(find.text(text).last);
      await t.pump(const Duration(seconds: 1));
    }

    await shoot(t, '118-9638', const CheckoutScreen(), overrides: await _o(), height: 960);
    await shoot(t, '118-9741', const CheckoutScreen(), overrides: await _o(), act: (t) => tap(t, 'استلام من المتجر'));
    await shoot(t, '118-9829', const CheckoutScreen(), overrides: await _o(), act: (t) => tap(t, 'التقويم'));
    await shoot(t, '118-10052', const CheckoutScreen(), overrides: await _o(paused: true));
    await shoot(t, '118-10144', const CheckoutScreen(), overrides: await _o(addresses: _HangingAddresses()));
    await shoot(
      t,
      '118-10199',
      const CheckoutScreen(),
      overrides: await _o(addresses: MockAddressRepository(seed: [_farm])),
    );
    await shoot(t, '118-10251', const CheckoutScreen(), overrides: await _o(failDays: true));
    await shoot(t, '118-10342', const CheckoutScreen(), overrides: await _o(), act: (t) => tap(t, '13'));
    await shoot(t, '118-10426', const CheckoutScreen(), overrides: await _o(), act: (t) => tap(t, '12'));
    await shoot(t, '118-10510', const CheckoutScreen(), overrides: await _o(), act: (t) => tap(t, '10'));
    await shoot(t, 'en-118-9638', const CheckoutScreen(), overrides: await _o(), lang: 'en', height: 960);
  });
}

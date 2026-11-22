import 'package:flutter_test/flutter_test.dart';
import 'package:jazlah/app/providers.dart';
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
import 'package:jazlah/features/catalog/domain/catalog.dart';
import 'package:jazlah/features/checkout/data/checkout_repository.dart';
import 'package:jazlah/features/checkout/data/order_repository.dart';
import 'package:jazlah/features/checkout/domain/fulfilment.dart';
import 'package:jazlah/features/checkout/domain/order.dart';
import 'package:jazlah/features/checkout/presentation/checkout_providers.dart';
import 'package:jazlah/features/checkout/presentation/order_placed_screen.dart';
import 'package:jazlah/features/checkout/presentation/review_screen.dart';
import 'package:jazlah/features/payment/data/payment_repository.dart';
import 'package:jazlah/features/payment/domain/payment_method.dart';
import 'package:jazlah/features/payment/presentation/payment_providers.dart';
import 'package:jazlah/features/product/data/mock_product_repository.dart';
import 'package:jazlah/features/product/domain/product.dart';
import 'package:jazlah/features/product/presentation/product_providers.dart';

import '../../test/helpers/fakes.dart';
import 'harness.dart';

/// Figma's address: Al Malqa, Riyadh.
const _home = Address(
  id: 'a1',
  label: 'المنزل',
  point: GeoPoint(24.8168, 46.6195),
  isDefault: true,
  city: 'الرياض',
  district: 'حي الملقا',
);

/// Tuesday 10 November 2026, 13:00 Riyadh; delivery on Wednesday 11 November like Figma.
DateTime _now() => DateTime.utc(2026, 11, 10, 10);

Future<List<dynamic>> _o() async {
  final tokens = MemoryTokens(const AuthTokens(accessToken: 'a', refreshToken: 'r'));
  final cart = MockCartRepository(delay: Duration.zero);
  await cart.add(const CartItemInput(productId: 'p-falah-ribeye', sizeId: 'sz-1kg', cutId: 'cut-slices', quantity: 2));
  await cart.add(const CartItemInput(productId: 'p-falah-lamb-kebab', sizeId: 'sz-500g'));
  cart.fulfilment = const FulfilmentChoice(method: Fulfilment.delivery, date: '2026-11-11', addressId: 'a1');
  final book = MockAddressRepository(seed: [_home]);
  final checkout = MockCheckoutRepository(cart, addresses: book, now: _now, delay: Duration.zero);
  return [
    tokenStorageProvider.overrideWithValue(tokens),
    authRepositoryProvider.overrideWithValue(MockAuthRepository(tokens)),
    productRepositoryProvider.overrideWithValue(MockProductRepository(delay: Duration.zero)),
    cartRepositoryProvider.overrideWithValue(cart),
    cartSettingsProvider.overrideWithValue(MockCartRepository.opsSettings),
    addressRepositoryProvider.overrideWithValue(book),
    checkoutRepositoryProvider.overrideWithValue(checkout),
    paymentRepositoryProvider.overrideWithValue(
      MockPaymentRepository(
        cart,
        MockOrderRepository(cart, checkout, addresses: book, now: _now),
        delay: Duration.zero,
      ),
    ),
  ];
}

final _order = Order(
  id: 'o-1',
  number: 'JZ-261110-0001',
  status: OrderStatus.created,
  vendorId: 'v-falah',
  vendorName: const LocalizedText('مجازر الفلاح', 'Al Falah Butchers'),
  fulfilment: Fulfilment.delivery,
  addressSnapshot: _home,
  deliveryDate: '2026-11-11',
  window: const TimeWindow('16:00', '18:00'),
  subtotal: 32300,
  discount: 0,
  deliveryFee: 1500,
  total: 33800,
  vatAmount: 4409,
  paymentMethod: PaymentMethodCode.mada,
  items: const [],
  createdAt: DateTime.utc(2026, 11, 10, 10),
);

void main() {
  setUpAll(loadFonts);

  testWidgets('review and order placed', (t) async {
    await shoot(t, '170-28952', const ReviewScreen(), overrides: await _o());
    await shoot(
      t,
      '170-29025',
      const ReviewScreen(),
      overrides: await _o(),
      act: (t) async {
        await t.tap(find.text('الدفع عند الاستلام'));
        await t.pump();
      },
    );
    const mada = PaymentMethodOption(method: PaymentMethodCode.mada, cardLast4: '4821');
    await shoot(t, '170-29472', OrderPlacedScreen(args: (order: _order, method: mada)));
    await shoot(t, 'en-170-28952', const ReviewScreen(), overrides: await _o(), lang: 'en');
    await shoot(t, 'en-170-29472', OrderPlacedScreen(args: (order: _order, method: mada)), lang: 'en');
  });
}

import 'dart:async';

import 'package:flutter/widgets.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:jazlah/app/providers.dart';
import 'package:jazlah/app/shell/main_shell.dart';
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
import 'package:jazlah/features/checkout/data/order_repository.dart';
import 'package:jazlah/features/checkout/domain/order.dart';
import 'package:jazlah/features/checkout/presentation/checkout_providers.dart';
import 'package:jazlah/features/orders/data/orders_repository.dart';
import 'package:jazlah/features/orders/presentation/order_detail_screen.dart';
import 'package:jazlah/features/orders/presentation/orders_providers.dart';
import 'package:jazlah/features/orders/presentation/orders_screen.dart';
import 'package:jazlah/features/payment/domain/payment_method.dart';
import 'package:jazlah/features/product/data/mock_product_repository.dart';
import 'package:jazlah/features/product/domain/product.dart';
import 'package:jazlah/features/product/presentation/product_providers.dart';

import '../../test/helpers/fakes.dart';
import 'harness.dart';

const _home = Address(
  id: 'a1',
  label: 'المنزل',
  point: GeoPoint(24.8168, 46.6195),
  isDefault: true,
  city: 'الرياض',
  district: 'حي الملقا',
);

/// Placed on Tuesday 10 November 2026 at 09:12 Riyadh; delivered «اليوم» on Wednesday 11 like Figma.
DateTime _now() => DateTime.utc(2026, 11, 10, 6, 12);

class _Hanging extends MockOrderRepository {
  _Hanging(super.cart, super.checkout, {required super.addresses});

  @override
  Future<List<Order>> list({OrderScope? scope}) => hang();

  @override
  Future<OrderDetail> detail(String id) => hang();
}

Future<List<dynamic>> _o(
  WidgetTester t, {
  bool seed = true,
  bool place = true,
  bool hanging = false,
  bool mocks = true,
  bool signedIn = true,
  String? status,
}) async {
  final cart = MockCartRepository(delay: Duration.zero);
  await cart.add(const CartItemInput(productId: 'p-falah-ribeye', sizeId: 'sz-1kg', cutId: 'cut-slices', quantity: 2));
  await cart.add(const CartItemInput(productId: 'p-falah-lamb-kebab', sizeId: 'sz-500g'));
  cart.fulfilment = const FulfilmentChoice(method: Fulfilment.delivery, date: '2026-11-11', addressId: 'a1');
  final book = MockAddressRepository(seed: [_home]);
  final checkout = MockCheckoutRepository(cart, addresses: book, now: _now, delay: Duration.zero);
  final orders = hanging
      ? _Hanging(cart, checkout, addresses: book)
      : MockOrderRepository(cart, checkout, addresses: book, now: _now, seedPast: seed, delay: Duration.zero);
  if (place) {
    await t.runAsync(() => orders.place(idempotencyKey: 'k', paymentMethod: PaymentMethodCode.mada));
    orders
      ..decide('pay-o-3-1', approve: true)
      ..transition('o-3', status ?? OrderStatus.preparing);
  }
  final tokens = MemoryTokens(signedIn ? const AuthTokens(accessToken: 'a', refreshToken: 'r') : null);
  return [
    tokenStorageProvider.overrideWithValue(tokens),
    authRepositoryProvider.overrideWithValue(MockAuthRepository(tokens)),
    productRepositoryProvider.overrideWithValue(MockProductRepository(delay: Duration.zero)),
    cartRepositoryProvider.overrideWithValue(cart),
    addressRepositoryProvider.overrideWithValue(book),
    checkoutRepositoryProvider.overrideWithValue(checkout),
    orderRepositoryProvider.overrideWithValue(orders),
    ordersRepositoryProvider.overrideWithValue(mocks ? orders : null),
    orderRealtimeProvider.overrideWithValue(null),
    ordersClockProvider.overrideWithValue(() => DateTime.utc(2026, 11, 11, 10)),
  ];
}

Widget _tab() => const MainShell(location: '/orders', child: OrdersScreen());

void main() {
  setUpAll(loadFonts);

  testWidgets('orders', (t) async {
    await shoot(t, '135-63663', _tab(), overrides: await _o(t, status: OrderStatus.outForDelivery));
    await shoot(t, '135-63749', _tab(), overrides: await _o(t, place: false, hanging: true));
    await shoot(t, '135-63826', _tab(), overrides: await _o(t, place: false, seed: false));
    await shoot(t, '135-63940', _tab(), overrides: await _o(t, mocks: false));
    await shoot(t, '135-64028', _tab(), overrides: await _o(t, signedIn: false));
    await shoot(t, '135-64189', const OrderDetailScreen(id: 'o-3'), overrides: await _o(t));
    await shoot(t, 'full-135-64189', const OrderDetailScreen(id: 'o-3'), overrides: await _o(t), height: 1500);
    await shoot(
      t,
      '135-64272',
      const OrderDetailScreen(id: 'o-3'),
      overrides: await _o(t, hanging: true, place: false),
    );
    await shoot(t, '135-64339', const OrderDetailScreen(id: 'o-3'), overrides: await _o(t, mocks: false));
    await shoot(t, '135-64401', const OrderDetailScreen(id: 'o-99'), overrides: await _o(t));
    await shoot(t, 'en-135-63663', _tab(), overrides: await _o(t), lang: 'en');
  });
}

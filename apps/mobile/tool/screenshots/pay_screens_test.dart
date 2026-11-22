import 'package:flutter/widgets.dart';
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
import 'package:jazlah/features/checkout/data/checkout_repository.dart';
import 'package:jazlah/features/checkout/data/order_repository.dart';
import 'package:jazlah/features/checkout/domain/order.dart';
import 'package:jazlah/features/checkout/presentation/checkout_providers.dart';
import 'package:jazlah/features/payment/data/payment_gateway.dart';
import 'package:jazlah/features/payment/data/payment_repository.dart';
import 'package:jazlah/features/payment/domain/payment_method.dart';
import 'package:jazlah/features/payment/presentation/payment_providers.dart';
import 'package:jazlah/features/payment/presentation/payment_screen.dart';
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

DateTime _now() => DateTime.utc(2026, 11, 10, 10);

/// The gateway step still running (Figma draws no page over the screen).
class _Hanging implements PaymentGateway {
  @override
  Future<GatewayResult> startPayment(BuildContext context, PaymentAction action) => hang();
}

/// The bank declines at once.
class _Declining implements PaymentGateway {
  _Declining(this.orders);

  final MockOrderRepository orders;

  @override
  Future<GatewayResult> startPayment(BuildContext context, PaymentAction action) async {
    orders.decide(action.paymentId, approve: false);
    return GatewayResult.finished;
  }
}

class _NoMethods extends MockPaymentRepository {
  _NoMethods(super.cart, super.orders) : super(delay: Duration.zero);

  @override
  Future<PaymentMethods> methods({String? orderId}) async {
    final all = await super.methods(orderId: orderId);
    return PaymentMethods(
      options: [
        for (final m in all.options) PaymentMethodOption(method: m.method, cardLast4: m.cardLast4, available: false),
      ],
    );
  }
}

Future<(List<dynamic>, PlacedOrder)> _o(WidgetTester t, {String gateway = 'fake', bool none = false}) async {
  final tokens = MemoryTokens(const AuthTokens(accessToken: 'a', refreshToken: 'r'));
  final cart = MockCartRepository(delay: Duration.zero);
  await cart.add(const CartItemInput(productId: 'p-falah-ribeye', sizeId: 'sz-1kg', cutId: 'cut-slices', quantity: 2));
  await cart.add(const CartItemInput(productId: 'p-falah-lamb-kebab', sizeId: 'sz-500g'));
  cart.fulfilment = const FulfilmentChoice(method: Fulfilment.delivery, date: '2026-11-11', addressId: 'a1');
  final book = MockAddressRepository(seed: [_home]);
  final checkout = MockCheckoutRepository(cart, addresses: book, now: _now, delay: Duration.zero);
  final orders = MockOrderRepository(cart, checkout, addresses: book, now: _now, delay: Duration.zero);
  final placed = (await t.runAsync(() => orders.place(idempotencyKey: 'k', paymentMethod: PaymentMethodCode.mada)))!;
  return (
    [
      tokenStorageProvider.overrideWithValue(tokens),
      authRepositoryProvider.overrideWithValue(MockAuthRepository(tokens)),
      productRepositoryProvider.overrideWithValue(MockProductRepository(delay: Duration.zero)),
      cartRepositoryProvider.overrideWithValue(cart),
      cartSettingsProvider.overrideWithValue(MockCartRepository.opsSettings),
      addressRepositoryProvider.overrideWithValue(book),
      checkoutRepositoryProvider.overrideWithValue(checkout),
      orderRepositoryProvider.overrideWithValue(orders),
      paymentRepositoryProvider.overrideWithValue(
        none ? _NoMethods(cart, orders) : MockPaymentRepository(cart, orders, delay: Duration.zero),
      ),
      paymentGatewayProvider.overrideWithValue(switch (gateway) {
        'hang' => _Hanging(),
        'decline' => _Declining(orders),
        _ => MockHostedPageGateway(orders.hostedPage),
      }),
    ],
    placed,
  );
}

void main() {
  setUpAll(loadFonts);

  testWidgets('payment step', (t) async {
    var (o, p) = await _o(t, gateway: 'hang');
    await shoot(
      t,
      '170-29134',
      PaymentScreen(orderId: p.order.id, placed: p),
      overrides: o,
    );
    (o, p) = await _o(t, gateway: 'decline');
    await shoot(
      t,
      '170-29244',
      PaymentScreen(orderId: p.order.id, placed: p),
      overrides: o,
    );
    (o, p) = await _o(t, none: true);
    await shoot(t, 'pay-no-usable-method', PaymentScreen(orderId: p.order.id), overrides: o);
    (o, p) = await _o(t);
    await shoot(
      t,
      'pay-fake-gateway',
      PaymentScreen(orderId: p.order.id, placed: p),
      overrides: o,
    );
    (o, p) = await _o(t, gateway: 'decline');
    await shoot(
      t,
      'en-170-29244',
      PaymentScreen(orderId: p.order.id, placed: p),
      overrides: o,
      lang: 'en',
    );
  });
}

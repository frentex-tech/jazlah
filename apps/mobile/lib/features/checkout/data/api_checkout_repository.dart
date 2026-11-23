import 'package:jazla_api/jazla_api.dart';

import 'package:jazlah/core/errors/api_error.dart';
import 'package:jazlah/features/cart/data/api_cart_repository.dart';
import 'package:jazlah/features/cart/domain/cart.dart';
import 'package:jazlah/features/checkout/data/checkout_repository.dart';
import 'package:jazlah/features/checkout/domain/fulfilment.dart';
import 'package:jazlah/features/product/domain/product.dart';

/// Checkout step 1 on the API: the pause from `GET /v1/public/settings/client` (SCH-API-1), the days from
/// `GET /v1/customer/checkout/days` and the save as `PATCH /v1/customer/cart/fulfilment` (SCH-API-2).
class ApiCheckoutRepository implements CheckoutRepository {
  ApiCheckoutRepository(this._api);

  final JazlaApi _api;

  Future<T> _call<T>(Future<T> Function() f) async {
    try {
      return await f();
    } catch (e) {
      throw ApiError.from(e);
    }
  }

  static FulfilmentMethod _method(Fulfilment m) =>
      m == Fulfilment.pickup ? FulfilmentMethod.pickup : FulfilmentMethod.delivery;

  @override
  Future<OrderingPause> pause() => _call(() async {
    final p = (await _api.getPublicSettingsApi().publicGetClientSettings()).data!.paused;
    return OrderingPause(isPaused: p.isPaused, messageAr: p.messageAr ?? '', messageEn: p.messageEn ?? '');
  });

  @override
  Future<List<CheckoutDay>> days(Fulfilment method) => _call(() async {
    final res = (await _api.getCustomerSchedulingApi().customerListCheckoutDays(method: _method(method))).data!;
    return [
      for (final d in res.items)
        CheckoutDay(
          date: d.date,
          available: d.isAvailable,
          reason: d.reason?.value,
          window: d.window == null ? null : TimeWindow(d.window!.start, d.window!.end),
        ),
    ];
  });

  @override
  Future<Cart> save(FulfilmentChoice choice) => _call(
    () async => cartFrom(
      (await _api.getCustomerCartApi().customerSetCartFulfilment(
        setCartFulfilmentDto: SetCartFulfilmentDto(
          method: _method(choice.method),
          addressId: choice.addressId,
          date: choice.date,
        ),
      )).data!,
    ),
  );
}

/// The ops settings the device cart needs, from `GET /v1/public/settings/client` (minimum order, delivery fee).
Future<CartSettings> clientCartSettings(JazlaApi api) async {
  try {
    final s = (await api.getPublicSettingsApi().publicGetClientSettings()).data!;
    return CartSettings(minOrder: s.minOrderHalalas, deliveryFee: s.deliveryFeeHalalas);
  } catch (e) {
    throw ApiError.from(e);
  }
}

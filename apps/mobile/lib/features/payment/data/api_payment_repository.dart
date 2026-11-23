import 'package:jazla_api/jazla_api.dart';

import 'package:jazlah/core/errors/api_error.dart';
import 'package:jazlah/features/checkout/data/api_order_repository.dart';
import 'package:jazlah/features/checkout/domain/order.dart';
import 'package:jazlah/features/payment/data/payment_repository.dart';
import 'package:jazlah/features/payment/domain/payment_method.dart';

/// Payments on the API (PAY-API-1): the methods (`GET /v1/customer/checkout/payment-methods`), a new payment on an
/// unpaid order (`POST /v1/customer/orders/{id}/payments` with `Idempotency-Key`) and the outcome, always read from
/// the order (`GET /v1/customer/orders/{id}`, ORD-API-3).
class ApiPaymentRepository implements PaymentRepository {
  ApiPaymentRepository(this._api);

  final JazlaApi _api;

  Future<T> _call<T>(Future<T> Function() f) async {
    try {
      return await f();
    } catch (e) {
      throw ApiError.from(e);
    }
  }

  @override
  Future<PaymentMethods> methods({String? orderId}) => _call(() async {
    final res = (await _api.getCustomerCheckoutApi().customerListPaymentMethods(orderId: orderId)).data!;
    final balance = res.walletBalanceHalalas;
    return PaymentMethods(
      options: [
        for (final o in res.items)
          PaymentMethodOption(method: o.method.value, available: o.isAvailable, reason: o.reason?.value),
      ],
      // The wallet part of the cart: the balance when it covers part of the total. An order's tender is fixed when
      // it is placed, so a payment on an order offers none.
      tender: orderId == null && balance > 0 && balance < res.totalHalalas ? TenderPlan(walletAmount: balance) : null,
    );
  });

  @override
  Future<PlacedOrder> retry({required String orderId, required String method, required String idempotencyKey}) => _call(
    () async => placedFrom(
      (await _api.getCustomerCheckoutApi().customerCreateOrderPayment(
        id: orderId,
        idempotencyKey: idempotencyKey,
        createPaymentDto: CreatePaymentDto(paymentMethod: paymentMethodFrom(method)),
      )).data!,
    ),
  );

  @override
  Future<OrderPayment> status(String orderId) =>
      _call(() async => orderPaymentFrom((await _api.getCustomerOrdersApi().customerGetOrder(id: orderId)).data!));
}

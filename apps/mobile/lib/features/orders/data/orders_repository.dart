import 'package:jazlah/features/checkout/domain/order.dart';

/// `scope` of the customer order list: current (open) or past (done). Null asks for both («الكل»).
enum OrderScope { current, past }

/// The customer order routes of ORD-API-3.
abstract interface class OrdersRepository {
  /// `GET /v1/customer/orders?scope=`, newest first.
  Future<List<Order>> list({OrderScope? scope});

  /// `GET /v1/customer/orders/:id`. Throws NOT_FOUND for an order of another account.
  Future<OrderDetail> detail(String id);
}

/// The realtime port (ORD-API-3 `order.updated` to the `user:{id}` room): the ids of the caller's orders that
/// changed. The socket client replaces the mock once the gateway exists.
// ignore: one_member_abstracts, the seam between the socket and the USE_MOCKS events.
abstract interface class OrderRealtime {
  Stream<String> orderUpdated();
}

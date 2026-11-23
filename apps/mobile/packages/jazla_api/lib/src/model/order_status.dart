//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:json_annotation/json_annotation.dart';

/// Where the order is.
enum OrderStatus {
          /// Where the order is.
      @JsonValue(r'pending_payment')
      pendingPayment(r'pending_payment'),
          /// Where the order is.
      @JsonValue(r'new')
      new_(r'new'),
          /// Where the order is.
      @JsonValue(r'confirmed')
      confirmed(r'confirmed'),
          /// Where the order is.
      @JsonValue(r'preparing')
      preparing(r'preparing'),
          /// Where the order is.
      @JsonValue(r'ready')
      ready(r'ready'),
          /// Where the order is.
      @JsonValue(r'picked_up')
      pickedUp(r'picked_up'),
          /// Where the order is.
      @JsonValue(r'out_for_delivery')
      outForDelivery(r'out_for_delivery'),
          /// Where the order is.
      @JsonValue(r'delivered')
      delivered(r'delivered'),
          /// Where the order is.
      @JsonValue(r'collected')
      collected(r'collected'),
          /// Where the order is.
      @JsonValue(r'cancelled')
      cancelled(r'cancelled'),
          /// Where the order is.
      @JsonValue(r'delivery_failed')
      deliveryFailed(r'delivery_failed'),
          /// Where the order is.
      @JsonValue(r'returned')
      returned(r'returned'),
          /// Where the order is.
      @JsonValue(r'unknown_default_open_api')
      unknownDefaultOpenApi(r'unknown_default_open_api');

  const OrderStatus(this.value);

  final String value;

  @override
  String toString() => value;
}

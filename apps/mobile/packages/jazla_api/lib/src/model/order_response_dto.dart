//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:jazla_api/src/model/order_refund_response_dto.dart';
import 'package:jazla_api/src/model/order_status.dart';
import 'package:jazla_api/src/model/order_type.dart';
import 'package:jazla_api/src/model/pickup_point_response_dto.dart';
import 'package:jazla_api/src/model/order_payment_summary_response_dto.dart';
import 'package:jazla_api/src/model/payment_method.dart';
import 'package:jazla_api/src/model/time_window_dto.dart';
import 'package:jazla_api/src/model/order_vendor_response_dto.dart';
import 'package:jazla_api/src/model/order_customer_response_dto.dart';
import 'package:jazla_api/src/model/order_history_entry_response_dto.dart';
import 'package:jazla_api/src/model/order_item_response_dto.dart';
import 'package:jazla_api/src/model/order_address_response_dto.dart';
import 'package:jazla_api/src/model/fulfilment_method.dart';
import 'package:json_annotation/json_annotation.dart';

part 'order_response_dto.g.dart';


@JsonSerializable(
  checked: true,
  createToJson: true,
  disallowUnrecognizedKeys: false,
  explicitToJson: true,
)
class OrderResponseDto {
  /// Returns a new [OrderResponseDto] instance.
  OrderResponseDto({

    required  this.id,

    required  this.number,

    required  this.status,

    required  this.orderType,

    required  this.fulfilment,

    required  this.fulfilmentDate,

    required  this.vendor,

    required  this.customer,

    required  this.paymentMethod,

    required  this.totalHalalas,

    required  this.createdAt,

    required  this.items,

    required  this.address,

    required  this.pickupPoint,

    required  this.window,

    required  this.subtotalHalalas,

    required  this.discountHalalas,

    required  this.deliveryFeeHalalas,

    required  this.vatHalalas,

    required  this.couponCode,

    required  this.notes,

    required  this.cancelReason,

    required  this.expiresAt,

    required  this.payment,

    required  this.refunds,

    required  this.history,

    required  this.allowedTransitions,
  });

      /// The order (UUID).
  @JsonKey(
    
    name: r'id',
    required: true,
    includeIfNull: false,
  )


  final String id;



      /// The order number customers and staff quote: `JZ-` + the Riyadh date `YYMMDD` + `-` + a 4-digit sequence of that day.
  @JsonKey(
    
    name: r'number',
    required: true,
    includeIfNull: false,
  )


  final String number;



      /// Where the order is.
  @JsonKey(
    
    name: r'status',
    required: true,
    includeIfNull: false,
  unknownEnumValue: OrderStatus.unknownDefaultOpenApi,
  )


  final OrderStatus status;



      /// The kind of order, from its lines; `mixed` for several kinds.
  @JsonKey(
    
    name: r'orderType',
    required: true,
    includeIfNull: false,
  unknownEnumValue: OrderType.unknownDefaultOpenApi,
  )


  final OrderType orderType;



      /// Delivered or picked up.
  @JsonKey(
    
    name: r'fulfilment',
    required: true,
    includeIfNull: false,
  unknownEnumValue: FulfilmentMethod.unknownDefaultOpenApi,
  )


  final FulfilmentMethod fulfilment;



      /// The delivery or pickup day, Riyadh calendar `yyyy-MM-dd`.
  @JsonKey(
    
    name: r'fulfilmentDate',
    required: true,
    includeIfNull: false,
  )


  final String fulfilmentDate;



      /// The store that fulfils it.
  @JsonKey(
    
    name: r'vendor',
    required: true,
    includeIfNull: false,
  )


  final OrderVendorResponseDto vendor;



      /// Who placed it.
  @JsonKey(
    
    name: r'customer',
    required: true,
    includeIfNull: false,
  )


  final OrderCustomerResponseDto customer;



      /// The method chosen (beside any wallet part).
  @JsonKey(
    
    name: r'paymentMethod',
    required: true,
    includeIfNull: false,
  unknownEnumValue: PaymentMethod.unknownDefaultOpenApi,
  )


  final PaymentMethod paymentMethod;



      /// What the customer pays in all, in halalas, VAT included.
  @JsonKey(
    
    name: r'totalHalalas',
    required: true,
    includeIfNull: false,
  )


  final int totalHalalas;



      /// When it was placed (UTC).
  @JsonKey(
    
    name: r'createdAt',
    required: true,
    includeIfNull: false,
  )


  final DateTime createdAt;



      /// The lines, in the order added.
  @JsonKey(
    
    name: r'items',
    required: true,
    includeIfNull: false,
  )


  final List<OrderItemResponseDto> items;



      /// The delivery address as placed; null for pickup.
  @JsonKey(
    
    name: r'address',
    required: true,
    includeIfNull: true,
  )


  final OrderAddressResponseDto? address;



      /// Where to collect it; null for delivery.
  @JsonKey(
    
    name: r'pickupPoint',
    required: true,
    includeIfNull: true,
  )


  final PickupPointResponseDto? pickupPoint;



      /// The delivery window, Riyadh time; null for pickup (see pickupPoint.hours).
  @JsonKey(
    
    name: r'window',
    required: true,
    includeIfNull: true,
  )


  final TimeWindowDto? window;



      /// The lines’ total, in halalas, VAT included.
  @JsonKey(
    
    name: r'subtotalHalalas',
    required: true,
    includeIfNull: false,
  )


  final int subtotalHalalas;



      /// The coupon discount, in halalas; 0 for none. Never applied to the delivery fee.
  @JsonKey(
    
    name: r'discountHalalas',
    required: true,
    includeIfNull: false,
  )


  final int discountHalalas;



      /// The delivery fee, in halalas; 0 for pickup.
  @JsonKey(
    
    name: r'deliveryFeeHalalas',
    required: true,
    includeIfNull: false,
  )


  final int deliveryFeeHalalas;



      /// The VAT inside totalHalalas: round half up of total × 15 / 115.
  @JsonKey(
    
    name: r'vatHalalas',
    required: true,
    includeIfNull: false,
  )


  final int vatHalalas;



      /// The coupon applied, upper case; null for none.
  @JsonKey(
    
    name: r'couponCode',
    required: true,
    includeIfNull: true,
  )


  final String? couponCode;



      /// The customer’s note on the order; null for none.
  @JsonKey(
    
    name: r'notes',
    required: true,
    includeIfNull: true,
  )


  final String? notes;



      /// Why it was cancelled; for a rejected COD order this is the vendor’s or admin’s required transition note. Null otherwise.
  @JsonKey(
    
    name: r'cancelReason',
    required: true,
    includeIfNull: true,
  )


  final String? cancelReason;



      /// Reserved for the payment-expiry task; null in the COD-only API while that task is deferred.
  @JsonKey(
    
    name: r'expiresAt',
    required: true,
    includeIfNull: true,
  )


  final DateTime? expiresAt;



      /// How it is paid.
  @JsonKey(
    
    name: r'payment',
    required: true,
    includeIfNull: false,
  )


  final OrderPaymentSummaryResponseDto payment;



      /// Refunds made; empty for none (Sprint 4).
  @JsonKey(
    
    name: r'refunds',
    required: true,
    includeIfNull: false,
  )


  final List<OrderRefundResponseDto> refunds;



      /// Every move of the order, oldest first.
  @JsonKey(
    
    name: r'history',
    required: true,
    includeIfNull: false,
  )


  final List<OrderHistoryEntryResponseDto> history;



      /// The statuses this caller may move it to now with POST …/orders/{id}/transition, from the order state machine; empty for none. Customers cannot move order statuses in Sprint 3.
  @JsonKey(
    
    name: r'allowedTransitions',
    required: true,
    includeIfNull: false,
  )


  final List<OrderStatus> allowedTransitions;





    @override
    bool operator ==(Object other) => identical(this, other) || other is OrderResponseDto &&
      other.id == id &&
      other.number == number &&
      other.status == status &&
      other.orderType == orderType &&
      other.fulfilment == fulfilment &&
      other.fulfilmentDate == fulfilmentDate &&
      other.vendor == vendor &&
      other.customer == customer &&
      other.paymentMethod == paymentMethod &&
      other.totalHalalas == totalHalalas &&
      other.createdAt == createdAt &&
      other.items == items &&
      other.address == address &&
      other.pickupPoint == pickupPoint &&
      other.window == window &&
      other.subtotalHalalas == subtotalHalalas &&
      other.discountHalalas == discountHalalas &&
      other.deliveryFeeHalalas == deliveryFeeHalalas &&
      other.vatHalalas == vatHalalas &&
      other.couponCode == couponCode &&
      other.notes == notes &&
      other.cancelReason == cancelReason &&
      other.expiresAt == expiresAt &&
      other.payment == payment &&
      other.refunds == refunds &&
      other.history == history &&
      other.allowedTransitions == allowedTransitions;

    @override
    int get hashCode =>
        id.hashCode +
        number.hashCode +
        status.hashCode +
        orderType.hashCode +
        fulfilment.hashCode +
        fulfilmentDate.hashCode +
        vendor.hashCode +
        customer.hashCode +
        paymentMethod.hashCode +
        totalHalalas.hashCode +
        createdAt.hashCode +
        items.hashCode +
        (address == null ? 0 : address.hashCode) +
        (pickupPoint == null ? 0 : pickupPoint.hashCode) +
        (window == null ? 0 : window.hashCode) +
        subtotalHalalas.hashCode +
        discountHalalas.hashCode +
        deliveryFeeHalalas.hashCode +
        vatHalalas.hashCode +
        (couponCode == null ? 0 : couponCode.hashCode) +
        (notes == null ? 0 : notes.hashCode) +
        (cancelReason == null ? 0 : cancelReason.hashCode) +
        (expiresAt == null ? 0 : expiresAt.hashCode) +
        payment.hashCode +
        refunds.hashCode +
        history.hashCode +
        allowedTransitions.hashCode;

  factory OrderResponseDto.fromJson(Map<String, dynamic> json) => _$OrderResponseDtoFromJson(json);

  Map<String, dynamic> toJson() => _$OrderResponseDtoToJson(this);

  @override
  String toString() {
    return toJson().toString();
  }

}


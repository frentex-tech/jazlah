//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:jazla_api/src/model/order_vendor_response_dto.dart';
import 'package:jazla_api/src/model/order_status.dart';
import 'package:jazla_api/src/model/order_type.dart';
import 'package:jazla_api/src/model/order_customer_response_dto.dart';
import 'package:jazla_api/src/model/payment_method.dart';
import 'package:jazla_api/src/model/fulfilment_method.dart';
import 'package:json_annotation/json_annotation.dart';

part 'order_summary_response_dto.g.dart';


@JsonSerializable(
  checked: true,
  createToJson: true,
  disallowUnrecognizedKeys: false,
  explicitToJson: true,
)
class OrderSummaryResponseDto {
  /// Returns a new [OrderSummaryResponseDto] instance.
  OrderSummaryResponseDto({

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





    @override
    bool operator ==(Object other) => identical(this, other) || other is OrderSummaryResponseDto &&
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
      other.createdAt == createdAt;

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
        createdAt.hashCode;

  factory OrderSummaryResponseDto.fromJson(Map<String, dynamic> json) => _$OrderSummaryResponseDtoFromJson(json);

  Map<String, dynamic> toJson() => _$OrderSummaryResponseDtoToJson(this);

  @override
  String toString() {
    return toJson().toString();
  }

}


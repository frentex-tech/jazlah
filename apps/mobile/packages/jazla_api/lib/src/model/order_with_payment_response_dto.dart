//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:jazla_api/src/model/order_response_dto.dart';
import 'package:jazla_api/src/model/payment_response_dto.dart';
import 'package:json_annotation/json_annotation.dart';

part 'order_with_payment_response_dto.g.dart';


@JsonSerializable(
  checked: true,
  createToJson: true,
  disallowUnrecognizedKeys: false,
  explicitToJson: true,
)
class OrderWithPaymentResponseDto {
  /// Returns a new [OrderWithPaymentResponseDto] instance.
  OrderWithPaymentResponseDto({

    required  this.order,

    required  this.payment,
  });

      /// The order as it is now.
  @JsonKey(
    
    name: r'order',
    required: true,
    includeIfNull: false,
  )


  final OrderResponseDto order;



      /// The payment attempt; null when no payment record is made (cash on delivery).
  @JsonKey(
    
    name: r'payment',
    required: true,
    includeIfNull: true,
  )


  final PaymentResponseDto? payment;





    @override
    bool operator ==(Object other) => identical(this, other) || other is OrderWithPaymentResponseDto &&
      other.order == order &&
      other.payment == payment;

    @override
    int get hashCode =>
        order.hashCode +
        (payment == null ? 0 : payment.hashCode);

  factory OrderWithPaymentResponseDto.fromJson(Map<String, dynamic> json) => _$OrderWithPaymentResponseDtoFromJson(json);

  Map<String, dynamic> toJson() => _$OrderWithPaymentResponseDtoToJson(this);

  @override
  String toString() {
    return toJson().toString();
  }

}


//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:jazla_api/src/model/payment_method.dart';
import 'package:json_annotation/json_annotation.dart';

part 'create_payment_dto.g.dart';


@JsonSerializable(
  checked: true,
  createToJson: true,
  disallowUnrecognizedKeys: false,
  explicitToJson: true,
)
class CreatePaymentDto {
  /// Returns a new [CreatePaymentDto] instance.
  CreatePaymentDto({

    required  this.paymentMethod,

     this.walletAmountHalalas,
  });

      /// The method, from GET /v1/customer/checkout/payment-methods?orderId=.
  @JsonKey(
    
    name: r'paymentMethod',
    required: true,
    includeIfNull: false,
  unknownEnumValue: PaymentMethod.unknownDefaultOpenApi,
  )


  final PaymentMethod paymentMethod;



      /// Part of the total to take from the wallet with another method, in halalas, 0 to less than the total; left out: 0. With `wallet` leave it out: the whole total is taken. More than the balance: WALLET_INSUFFICIENT.
          // minimum: 0
  @JsonKey(
    
    name: r'walletAmountHalalas',
    required: false,
    includeIfNull: false,
  )


  final int? walletAmountHalalas;





    @override
    bool operator ==(Object other) => identical(this, other) || other is CreatePaymentDto &&
      other.paymentMethod == paymentMethod &&
      other.walletAmountHalalas == walletAmountHalalas;

    @override
    int get hashCode =>
        paymentMethod.hashCode +
        walletAmountHalalas.hashCode;

  factory CreatePaymentDto.fromJson(Map<String, dynamic> json) => _$CreatePaymentDtoFromJson(json);

  Map<String, dynamic> toJson() => _$CreatePaymentDtoToJson(this);

  @override
  String toString() {
    return toJson().toString();
  }

}


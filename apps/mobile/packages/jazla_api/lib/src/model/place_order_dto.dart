//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:jazla_api/src/model/payment_method.dart';
import 'package:json_annotation/json_annotation.dart';

part 'place_order_dto.g.dart';


@JsonSerializable(
  checked: true,
  createToJson: true,
  disallowUnrecognizedKeys: false,
  explicitToJson: true,
)
class PlaceOrderDto {
  /// Returns a new [PlaceOrderDto] instance.
  PlaceOrderDto({

    required  this.paymentMethod,

     this.walletAmountHalalas,

     this.notes,
  });

      /// The method, from GET /v1/customer/checkout/payment-methods.
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



      /// A note on the order for the store, up to 500 characters.
  @JsonKey(
    
    name: r'notes',
    required: false,
    includeIfNull: false,
  )


  final String? notes;





    @override
    bool operator ==(Object other) => identical(this, other) || other is PlaceOrderDto &&
      other.paymentMethod == paymentMethod &&
      other.walletAmountHalalas == walletAmountHalalas &&
      other.notes == notes;

    @override
    int get hashCode =>
        paymentMethod.hashCode +
        walletAmountHalalas.hashCode +
        notes.hashCode;

  factory PlaceOrderDto.fromJson(Map<String, dynamic> json) => _$PlaceOrderDtoFromJson(json);

  Map<String, dynamic> toJson() => _$PlaceOrderDtoToJson(this);

  @override
  String toString() {
    return toJson().toString();
  }

}


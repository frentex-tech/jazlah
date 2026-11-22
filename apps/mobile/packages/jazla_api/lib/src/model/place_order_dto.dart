//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
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
  unknownEnumValue: PlaceOrderDtoPaymentMethodEnum.unknownDefaultOpenApi,
  )


  final PlaceOrderDtoPaymentMethodEnum paymentMethod;



      /// How much of the total to take from the wallet, in halalas, 0 up to the total (the whole total only with `wallet`); left out: 0. More than the balance: WALLET_INSUFFICIENT.
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

/// The method, from GET /v1/customer/checkout/payment-methods.
enum PlaceOrderDtoPaymentMethodEnum {
    /// The method, from GET /v1/customer/checkout/payment-methods.
@JsonValue(r'mada')
mada(r'mada'),
    /// The method, from GET /v1/customer/checkout/payment-methods.
@JsonValue(r'card')
card(r'card'),
    /// The method, from GET /v1/customer/checkout/payment-methods.
@JsonValue(r'applepay')
applepay(r'applepay'),
    /// The method, from GET /v1/customer/checkout/payment-methods.
@JsonValue(r'cod')
cod(r'cod'),
    /// The method, from GET /v1/customer/checkout/payment-methods.
@JsonValue(r'wallet')
wallet(r'wallet'),
    /// The method, from GET /v1/customer/checkout/payment-methods.
@JsonValue(r'unknown_default_open_api')
unknownDefaultOpenApi(r'unknown_default_open_api');

const PlaceOrderDtoPaymentMethodEnum(this.value);

final String value;

@override
String toString() => value;
}



//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
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

    required  this.method,

     this.walletAmountHalalas,
  });

      /// The method.
  @JsonKey(
    
    name: r'method',
    required: true,
    includeIfNull: false,
  unknownEnumValue: CreatePaymentDtoMethodEnum.unknownDefaultOpenApi,
  )


  final CreatePaymentDtoMethodEnum method;



      /// How much of the total to take from the wallet, in halalas, 0 up to the total (the whole total only with `wallet`); left out: 0. More than the balance: WALLET_INSUFFICIENT.
          // minimum: 0
  @JsonKey(
    
    name: r'walletAmountHalalas',
    required: false,
    includeIfNull: false,
  )


  final int? walletAmountHalalas;





    @override
    bool operator ==(Object other) => identical(this, other) || other is CreatePaymentDto &&
      other.method == method &&
      other.walletAmountHalalas == walletAmountHalalas;

    @override
    int get hashCode =>
        method.hashCode +
        walletAmountHalalas.hashCode;

  factory CreatePaymentDto.fromJson(Map<String, dynamic> json) => _$CreatePaymentDtoFromJson(json);

  Map<String, dynamic> toJson() => _$CreatePaymentDtoToJson(this);

  @override
  String toString() {
    return toJson().toString();
  }

}

/// The method.
enum CreatePaymentDtoMethodEnum {
    /// The method.
@JsonValue(r'mada')
mada(r'mada'),
    /// The method.
@JsonValue(r'card')
card(r'card'),
    /// The method.
@JsonValue(r'applepay')
applepay(r'applepay'),
    /// The method.
@JsonValue(r'cod')
cod(r'cod'),
    /// The method.
@JsonValue(r'wallet')
wallet(r'wallet'),
    /// The method.
@JsonValue(r'unknown_default_open_api')
unknownDefaultOpenApi(r'unknown_default_open_api');

const CreatePaymentDtoMethodEnum(this.value);

final String value;

@override
String toString() => value;
}



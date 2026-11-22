//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:json_annotation/json_annotation.dart';

part 'payment_method_option_response_dto.g.dart';


@JsonSerializable(
  checked: true,
  createToJson: true,
  disallowUnrecognizedKeys: false,
  explicitToJson: true,
)
class PaymentMethodOptionResponseDto {
  /// Returns a new [PaymentMethodOptionResponseDto] instance.
  PaymentMethodOptionResponseDto({

    required  this.method,

    required  this.isAvailable,

    required  this.reason,
  });

      /// The method.
  @JsonKey(
    
    name: r'method',
    required: true,
    includeIfNull: false,
  unknownEnumValue: PaymentMethodOptionResponseDtoMethodEnum.unknownDefaultOpenApi,
  )


  final PaymentMethodOptionResponseDtoMethodEnum method;



      /// Whether it can be chosen now; `false`: shown disabled with `reason`.
  @JsonKey(
    
    name: r'isAvailable',
    required: true,
    includeIfNull: false,
  )


  final bool isAvailable;



      /// Why not, when not available; null otherwise.
  @JsonKey(
    
    name: r'reason',
    required: true,
    includeIfNull: true,
  unknownEnumValue: PaymentMethodOptionResponseDtoReasonEnum.unknownDefaultOpenApi,
  )


  final PaymentMethodOptionResponseDtoReasonEnum? reason;





    @override
    bool operator ==(Object other) => identical(this, other) || other is PaymentMethodOptionResponseDto &&
      other.method == method &&
      other.isAvailable == isAvailable &&
      other.reason == reason;

    @override
    int get hashCode =>
        method.hashCode +
        isAvailable.hashCode +
        (reason == null ? 0 : reason.hashCode);

  factory PaymentMethodOptionResponseDto.fromJson(Map<String, dynamic> json) => _$PaymentMethodOptionResponseDtoFromJson(json);

  Map<String, dynamic> toJson() => _$PaymentMethodOptionResponseDtoToJson(this);

  @override
  String toString() {
    return toJson().toString();
  }

}

/// The method.
enum PaymentMethodOptionResponseDtoMethodEnum {
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

const PaymentMethodOptionResponseDtoMethodEnum(this.value);

final String value;

@override
String toString() => value;
}


/// Why not, when not available; null otherwise.
enum PaymentMethodOptionResponseDtoReasonEnum {
    /// Why not, when not available; null otherwise.
@JsonValue(r'insufficient_balance')
insufficientBalance(r'insufficient_balance'),
    /// Why not, when not available; null otherwise.
@JsonValue(r'unknown_default_open_api')
unknownDefaultOpenApi(r'unknown_default_open_api');

const PaymentMethodOptionResponseDtoReasonEnum(this.value);

final String value;

@override
String toString() => value;
}



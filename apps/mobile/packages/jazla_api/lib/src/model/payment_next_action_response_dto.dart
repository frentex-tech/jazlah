//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:json_annotation/json_annotation.dart';

part 'payment_next_action_response_dto.g.dart';


@JsonSerializable(
  checked: true,
  createToJson: true,
  disallowUnrecognizedKeys: false,
  explicitToJson: true,
)
class PaymentNextActionResponseDto {
  /// Returns a new [PaymentNextActionResponseDto] instance.
  PaymentNextActionResponseDto({

    required  this.type,

    required  this.redirectUrl,

    required  this.returnUrl,
  });

      /// Always `redirect` for now.
  @JsonKey(
    
    name: r'type',
    required: true,
    includeIfNull: false,
  unknownEnumValue: PaymentNextActionResponseDtoTypeEnum.unknownDefaultOpenApi,
  )


  final PaymentNextActionResponseDtoTypeEnum type;



      /// The hosted payment page to open. On staging the fake provider’s page (approve or decline); never build or change it.
  @JsonKey(
    
    name: r'redirectUrl',
    required: true,
    includeIfNull: false,
  )


  final String redirectUrl;



      /// Where the page sends the customer when done: close the web view on this scheme, host and path (any query), then poll GET /v1/customer/orders/{id}.
  @JsonKey(
    
    name: r'returnUrl',
    required: true,
    includeIfNull: false,
  )


  final String returnUrl;





    @override
    bool operator ==(Object other) => identical(this, other) || other is PaymentNextActionResponseDto &&
      other.type == type &&
      other.redirectUrl == redirectUrl &&
      other.returnUrl == returnUrl;

    @override
    int get hashCode =>
        type.hashCode +
        redirectUrl.hashCode +
        returnUrl.hashCode;

  factory PaymentNextActionResponseDto.fromJson(Map<String, dynamic> json) => _$PaymentNextActionResponseDtoFromJson(json);

  Map<String, dynamic> toJson() => _$PaymentNextActionResponseDtoToJson(this);

  @override
  String toString() {
    return toJson().toString();
  }

}

/// Always `redirect` for now.
enum PaymentNextActionResponseDtoTypeEnum {
    /// Always `redirect` for now.
@JsonValue(r'redirect')
redirect(r'redirect'),
    /// Always `redirect` for now.
@JsonValue(r'unknown_default_open_api')
unknownDefaultOpenApi(r'unknown_default_open_api');

const PaymentNextActionResponseDtoTypeEnum(this.value);

final String value;

@override
String toString() => value;
}



//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:json_annotation/json_annotation.dart';

part 'set_cart_fulfilment_dto.g.dart';


@JsonSerializable(
  checked: true,
  createToJson: true,
  disallowUnrecognizedKeys: false,
  explicitToJson: true,
)
class SetCartFulfilmentDto {
  /// Returns a new [SetCartFulfilmentDto] instance.
  SetCartFulfilmentDto({

    required  this.method,

     this.addressId,

    required  this.date,
  });

      /// `delivery` or `pickup`; one the cart’s products allow (FULFILMENT_NOT_SUPPORTED otherwise).
  @JsonKey(
    
    name: r'method',
    required: true,
    includeIfNull: false,
  unknownEnumValue: SetCartFulfilmentDtoMethodEnum.unknownDefaultOpenApi,
  )


  final SetCartFulfilmentDtoMethodEnum method;



      /// One of the customer’s saved addresses (UUID); required for delivery, ignored for pickup.
  @JsonKey(
    
    name: r'addressId',
    required: false,
    includeIfNull: false,
  )


  final String? addressId;



      /// The day, `yyyy-MM-dd`, one GET /v1/customer/checkout/days offers.
  @JsonKey(
    
    name: r'date',
    required: true,
    includeIfNull: false,
  )


  final String date;





    @override
    bool operator ==(Object other) => identical(this, other) || other is SetCartFulfilmentDto &&
      other.method == method &&
      other.addressId == addressId &&
      other.date == date;

    @override
    int get hashCode =>
        method.hashCode +
        addressId.hashCode +
        date.hashCode;

  factory SetCartFulfilmentDto.fromJson(Map<String, dynamic> json) => _$SetCartFulfilmentDtoFromJson(json);

  Map<String, dynamic> toJson() => _$SetCartFulfilmentDtoToJson(this);

  @override
  String toString() {
    return toJson().toString();
  }

}

/// `delivery` or `pickup`; one the cart’s products allow (FULFILMENT_NOT_SUPPORTED otherwise).
enum SetCartFulfilmentDtoMethodEnum {
    /// `delivery` or `pickup`; one the cart’s products allow (FULFILMENT_NOT_SUPPORTED otherwise).
@JsonValue(r'delivery')
delivery(r'delivery'),
    /// `delivery` or `pickup`; one the cart’s products allow (FULFILMENT_NOT_SUPPORTED otherwise).
@JsonValue(r'pickup')
pickup(r'pickup'),
    /// `delivery` or `pickup`; one the cart’s products allow (FULFILMENT_NOT_SUPPORTED otherwise).
@JsonValue(r'unknown_default_open_api')
unknownDefaultOpenApi(r'unknown_default_open_api');

const SetCartFulfilmentDtoMethodEnum(this.value);

final String value;

@override
String toString() => value;
}



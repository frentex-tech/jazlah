//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:jazla_api/src/model/fulfilment_method.dart';
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
  unknownEnumValue: FulfilmentMethod.unknownDefaultOpenApi,
  )


  final FulfilmentMethod method;



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


//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:jazla_api/src/model/pickup_point_response_dto.dart';
import 'package:jazla_api/src/model/time_window_dto.dart';
import 'package:json_annotation/json_annotation.dart';

part 'cart_fulfilment_response_dto.g.dart';


@JsonSerializable(
  checked: true,
  createToJson: true,
  disallowUnrecognizedKeys: false,
  explicitToJson: true,
)
class CartFulfilmentResponseDto {
  /// Returns a new [CartFulfilmentResponseDto] instance.
  CartFulfilmentResponseDto({

    required  this.method,

    required  this.addressId,

    required  this.date,

    required  this.window,

    required  this.pickupPoint,
  });

      /// Delivered or picked up.
  @JsonKey(
    
    name: r'method',
    required: true,
    includeIfNull: false,
  unknownEnumValue: CartFulfilmentResponseDtoMethodEnum.unknownDefaultOpenApi,
  )


  final CartFulfilmentResponseDtoMethodEnum method;



      /// The saved address for delivery; null for pickup.
  @JsonKey(
    
    name: r'addressId',
    required: true,
    includeIfNull: true,
  )


  final String? addressId;



      /// The day, `yyyy-MM-dd`.
  @JsonKey(
    
    name: r'date',
    required: true,
    includeIfNull: false,
  )


  final String date;



      /// The delivery window, Riyadh time; null for pickup.
  @JsonKey(
    
    name: r'window',
    required: true,
    includeIfNull: true,
  )


  final TimeWindowDto? window;



      /// Where to collect it; null for delivery.
  @JsonKey(
    
    name: r'pickupPoint',
    required: true,
    includeIfNull: true,
  )


  final PickupPointResponseDto? pickupPoint;





    @override
    bool operator ==(Object other) => identical(this, other) || other is CartFulfilmentResponseDto &&
      other.method == method &&
      other.addressId == addressId &&
      other.date == date &&
      other.window == window &&
      other.pickupPoint == pickupPoint;

    @override
    int get hashCode =>
        method.hashCode +
        (addressId == null ? 0 : addressId.hashCode) +
        date.hashCode +
        (window == null ? 0 : window.hashCode) +
        (pickupPoint == null ? 0 : pickupPoint.hashCode);

  factory CartFulfilmentResponseDto.fromJson(Map<String, dynamic> json) => _$CartFulfilmentResponseDtoFromJson(json);

  Map<String, dynamic> toJson() => _$CartFulfilmentResponseDtoToJson(this);

  @override
  String toString() {
    return toJson().toString();
  }

}

/// Delivered or picked up.
enum CartFulfilmentResponseDtoMethodEnum {
    /// Delivered or picked up.
@JsonValue(r'delivery')
delivery(r'delivery'),
    /// Delivered or picked up.
@JsonValue(r'pickup')
pickup(r'pickup'),
    /// Delivered or picked up.
@JsonValue(r'unknown_default_open_api')
unknownDefaultOpenApi(r'unknown_default_open_api');

const CartFulfilmentResponseDtoMethodEnum(this.value);

final String value;

@override
String toString() => value;
}



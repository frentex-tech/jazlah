//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:jazla_api/src/model/geo_point_dto.dart';
import 'package:jazla_api/src/model/localized_text_response_dto.dart';
import 'package:json_annotation/json_annotation.dart';

part 'order_vendor_response_dto.g.dart';


@JsonSerializable(
  checked: true,
  createToJson: true,
  disallowUnrecognizedKeys: false,
  explicitToJson: true,
)
class OrderVendorResponseDto {
  /// Returns a new [OrderVendorResponseDto] instance.
  OrderVendorResponseDto({

    required  this.id,

    required  this.name,

    required  this.phone,

    required  this.location,

    required  this.city,
  });

      /// The vendor (UUID).
  @JsonKey(
    
    name: r'id',
    required: true,
    includeIfNull: false,
  )


  final String id;



      /// The store’s name.
  @JsonKey(
    
    name: r'name',
    required: true,
    includeIfNull: false,
  )


  final LocalizedTextResponseDto name;



      /// The store’s contact number; null when it has none. Shown as \"call the store\".
  @JsonKey(
    
    name: r'phone',
    required: true,
    includeIfNull: true,
  )


  final String? phone;



      /// The store’s pin; null when it has none.
  @JsonKey(
    
    name: r'location',
    required: true,
    includeIfNull: true,
  )


  final GeoPointDto? location;



      /// The store’s city; null when not set.
  @JsonKey(
    
    name: r'city',
    required: true,
    includeIfNull: true,
  )


  final String? city;





    @override
    bool operator ==(Object other) => identical(this, other) || other is OrderVendorResponseDto &&
      other.id == id &&
      other.name == name &&
      other.phone == phone &&
      other.location == location &&
      other.city == city;

    @override
    int get hashCode =>
        id.hashCode +
        name.hashCode +
        (phone == null ? 0 : phone.hashCode) +
        (location == null ? 0 : location.hashCode) +
        (city == null ? 0 : city.hashCode);

  factory OrderVendorResponseDto.fromJson(Map<String, dynamic> json) => _$OrderVendorResponseDtoFromJson(json);

  Map<String, dynamic> toJson() => _$OrderVendorResponseDtoToJson(this);

  @override
  String toString() {
    return toJson().toString();
  }

}


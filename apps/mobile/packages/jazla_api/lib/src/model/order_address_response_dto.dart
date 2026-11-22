//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:jazla_api/src/model/geo_point_dto.dart';
import 'package:json_annotation/json_annotation.dart';

part 'order_address_response_dto.g.dart';


@JsonSerializable(
  checked: true,
  createToJson: true,
  disallowUnrecognizedKeys: false,
  explicitToJson: true,
)
class OrderAddressResponseDto {
  /// Returns a new [OrderAddressResponseDto] instance.
  OrderAddressResponseDto({

    required  this.label,

    required  this.location,

    required  this.city,

    required  this.district,

    required  this.street,

    required  this.building,

    required  this.shortNationalAddress,

    required  this.driverInstructions,
  });

      /// The address’s label.
  @JsonKey(
    
    name: r'label',
    required: true,
    includeIfNull: false,
  )


  final String label;



      /// The pin.
  @JsonKey(
    
    name: r'location',
    required: true,
    includeIfNull: false,
  )


  final GeoPointDto location;



      /// City; null when not given.
  @JsonKey(
    
    name: r'city',
    required: true,
    includeIfNull: true,
  )


  final String? city;



      /// District; null when not given.
  @JsonKey(
    
    name: r'district',
    required: true,
    includeIfNull: true,
  )


  final String? district;



      /// Street; null when not given.
  @JsonKey(
    
    name: r'street',
    required: true,
    includeIfNull: true,
  )


  final String? street;



      /// Building; null when not given.
  @JsonKey(
    
    name: r'building',
    required: true,
    includeIfNull: true,
  )


  final String? building;



      /// Short national address; null when not given.
  @JsonKey(
    
    name: r'shortNationalAddress',
    required: true,
    includeIfNull: true,
  )


  final String? shortNationalAddress;



      /// Notes for the driver; null for none.
  @JsonKey(
    
    name: r'driverInstructions',
    required: true,
    includeIfNull: true,
  )


  final String? driverInstructions;





    @override
    bool operator ==(Object other) => identical(this, other) || other is OrderAddressResponseDto &&
      other.label == label &&
      other.location == location &&
      other.city == city &&
      other.district == district &&
      other.street == street &&
      other.building == building &&
      other.shortNationalAddress == shortNationalAddress &&
      other.driverInstructions == driverInstructions;

    @override
    int get hashCode =>
        label.hashCode +
        location.hashCode +
        (city == null ? 0 : city.hashCode) +
        (district == null ? 0 : district.hashCode) +
        (street == null ? 0 : street.hashCode) +
        (building == null ? 0 : building.hashCode) +
        (shortNationalAddress == null ? 0 : shortNationalAddress.hashCode) +
        (driverInstructions == null ? 0 : driverInstructions.hashCode);

  factory OrderAddressResponseDto.fromJson(Map<String, dynamic> json) => _$OrderAddressResponseDtoFromJson(json);

  Map<String, dynamic> toJson() => _$OrderAddressResponseDtoToJson(this);

  @override
  String toString() {
    return toJson().toString();
  }

}


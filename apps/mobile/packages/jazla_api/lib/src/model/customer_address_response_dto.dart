//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:jazla_api/src/model/geo_point_dto.dart';
import 'package:json_annotation/json_annotation.dart';

part 'customer_address_response_dto.g.dart';


@JsonSerializable(
  checked: true,
  createToJson: true,
  disallowUnrecognizedKeys: false,
  explicitToJson: true,
)
class CustomerAddressResponseDto {
  /// Returns a new [CustomerAddressResponseDto] instance.
  CustomerAddressResponseDto({

    required  this.id,

    required  this.label,

    required  this.location,

    required  this.city,

    required  this.district,

    required  this.street,

    required  this.building,

    required  this.shortNationalAddress,

    required  this.driverInstructions,

    required  this.isDefault,

    required  this.createdAt,

    required  this.updatedAt,
  });

      /// The address id (UUID), for the `{id}` of /v1/customer/addresses/{id}.
  @JsonKey(
    
    name: r'id',
    required: true,
    includeIfNull: false,
  )


  final String id;



      /// The customer's name for the address (Home, Work), 1 to 30 characters.
  @JsonKey(
    
    name: r'label',
    required: true,
    includeIfNull: false,
  )


  final String label;



      /// The point on the map, in degrees.
  @JsonKey(
    
    name: r'location',
    required: true,
    includeIfNull: false,
  )


  final GeoPointDto location;



      /// The city; null when the customer gave none.
  @JsonKey(
    
    name: r'city',
    required: true,
    includeIfNull: true,
  )


  final String? city;



      /// The district (neighbourhood); null when the customer gave none.
  @JsonKey(
    
    name: r'district',
    required: true,
    includeIfNull: true,
  )


  final String? district;



      /// The street; null when the customer gave none.
  @JsonKey(
    
    name: r'street',
    required: true,
    includeIfNull: true,
  )


  final String? street;



      /// Building number, floor, apartment, as free text; null when the customer gave none.
  @JsonKey(
    
    name: r'building',
    required: true,
    includeIfNull: true,
  )


  final String? building;



      /// The Saudi short national address, always four uppercase Latin letters then four Latin digits; null when the customer gave none.
  @JsonKey(
    
    name: r'shortNationalAddress',
    required: true,
    includeIfNull: true,
  )


  final String? shortNationalAddress;



      /// Notes for the driver, up to 300 characters; null when the customer wrote none.
  @JsonKey(
    
    name: r'driverInstructions',
    required: true,
    includeIfNull: true,
  )


  final String? driverInstructions;



      /// Whether this is the customer's default address. Exactly one address is the default once any exist.
  @JsonKey(
    
    name: r'isDefault',
    required: true,
    includeIfNull: false,
  )


  final bool isDefault;



      /// When the address was saved, UTC (ISO 8601).
  @JsonKey(
    
    name: r'createdAt',
    required: true,
    includeIfNull: false,
  )


  final DateTime createdAt;



      /// When the address last changed, UTC (ISO 8601); becoming or stopping being the default counts as a change.
  @JsonKey(
    
    name: r'updatedAt',
    required: true,
    includeIfNull: false,
  )


  final DateTime updatedAt;





    @override
    bool operator ==(Object other) => identical(this, other) || other is CustomerAddressResponseDto &&
      other.id == id &&
      other.label == label &&
      other.location == location &&
      other.city == city &&
      other.district == district &&
      other.street == street &&
      other.building == building &&
      other.shortNationalAddress == shortNationalAddress &&
      other.driverInstructions == driverInstructions &&
      other.isDefault == isDefault &&
      other.createdAt == createdAt &&
      other.updatedAt == updatedAt;

    @override
    int get hashCode =>
        id.hashCode +
        label.hashCode +
        location.hashCode +
        (city == null ? 0 : city.hashCode) +
        (district == null ? 0 : district.hashCode) +
        (street == null ? 0 : street.hashCode) +
        (building == null ? 0 : building.hashCode) +
        (shortNationalAddress == null ? 0 : shortNationalAddress.hashCode) +
        (driverInstructions == null ? 0 : driverInstructions.hashCode) +
        isDefault.hashCode +
        createdAt.hashCode +
        updatedAt.hashCode;

  factory CustomerAddressResponseDto.fromJson(Map<String, dynamic> json) => _$CustomerAddressResponseDtoFromJson(json);

  Map<String, dynamic> toJson() => _$CustomerAddressResponseDtoToJson(this);

  @override
  String toString() {
    return toJson().toString();
  }

}


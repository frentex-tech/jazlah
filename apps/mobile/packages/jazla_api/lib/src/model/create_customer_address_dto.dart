//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:jazla_api/src/model/geo_point_dto.dart';
import 'package:json_annotation/json_annotation.dart';

part 'create_customer_address_dto.g.dart';


@JsonSerializable(
  checked: true,
  createToJson: true,
  disallowUnrecognizedKeys: false,
  explicitToJson: true,
)
class CreateCustomerAddressDto {
  /// Returns a new [CreateCustomerAddressDto] instance.
  CreateCustomerAddressDto({

     this.city,

     this.district,

     this.street,

     this.building,

     this.shortNationalAddress,

     this.driverInstructions,

    required  this.label,

    required  this.location,

     this.isDefault = false,
  });

      /// The city, up to 100 characters; surrounding spaces removed. Optional: left out, null or blank means none. In an update, left out keeps the current value and null or blank clears it.
  @JsonKey(
    
    name: r'city',
    required: false,
    includeIfNull: false,
  )


  final String? city;



      /// The district (neighbourhood), up to 100 characters; surrounding spaces removed. Optional: left out, null or blank means none. In an update, left out keeps the current value and null or blank clears it.
  @JsonKey(
    
    name: r'district',
    required: false,
    includeIfNull: false,
  )


  final String? district;



      /// The street, up to 100 characters; surrounding spaces removed. Optional: left out, null or blank means none. In an update, left out keeps the current value and null or blank clears it.
  @JsonKey(
    
    name: r'street',
    required: false,
    includeIfNull: false,
  )


  final String? street;



      /// Building number, floor, apartment, as free text up to 100 characters; surrounding spaces removed. Optional: left out, null or blank means none. In an update, left out keeps the current value and null or blank clears it.
  @JsonKey(
    
    name: r'building',
    required: false,
    includeIfNull: false,
  )


  final String? building;



      /// The Saudi short national address (Saudi Post): four letters then four digits. Spaces, lowercase and Arabic digits are accepted (`rrrd 2929`, `RRRD٢٩٢٩`) and it is stored and returned as `RRRD2929`; any other form is VALIDATION_FAILED. Optional: left out, null or blank means none. In an update, left out keeps the current value and null or blank clears it.
  @JsonKey(
    
    name: r'shortNationalAddress',
    required: false,
    includeIfNull: false,
  )


  final String? shortNationalAddress;



      /// Notes for the driver (which door, call before arriving), up to 300 characters; surrounding spaces removed. Optional: left out, null or blank means none. In an update, left out keeps the current value and null or blank clears it.
  @JsonKey(
    
    name: r'driverInstructions',
    required: false,
    includeIfNull: false,
  )


  final String? driverInstructions;



      /// The customer's name for the address (Home, Work), shown in the address list. Required; 1 to 30 characters after surrounding spaces are removed, counted in Unicode code points (an emoji with a variation selector counts as 2).
  @JsonKey(
    
    name: r'label',
    required: true,
    includeIfNull: false,
  )


  final String label;



      /// The point the customer picked on the map, in degrees (JSON numbers, not strings). Required.
  @JsonKey(
    
    name: r'location',
    required: true,
    includeIfNull: false,
  )


  final GeoPointDto location;



      /// true makes this address the default instead of the current one; false or left out keeps the current default. The customer's first address becomes the default anyway.
  @JsonKey(
    defaultValue: false,
    name: r'isDefault',
    required: false,
    includeIfNull: false,
  )


  final bool? isDefault;





    @override
    bool operator ==(Object other) => identical(this, other) || other is CreateCustomerAddressDto &&
      other.city == city &&
      other.district == district &&
      other.street == street &&
      other.building == building &&
      other.shortNationalAddress == shortNationalAddress &&
      other.driverInstructions == driverInstructions &&
      other.label == label &&
      other.location == location &&
      other.isDefault == isDefault;

    @override
    int get hashCode =>
        (city == null ? 0 : city.hashCode) +
        (district == null ? 0 : district.hashCode) +
        (street == null ? 0 : street.hashCode) +
        (building == null ? 0 : building.hashCode) +
        (shortNationalAddress == null ? 0 : shortNationalAddress.hashCode) +
        (driverInstructions == null ? 0 : driverInstructions.hashCode) +
        label.hashCode +
        location.hashCode +
        isDefault.hashCode;

  factory CreateCustomerAddressDto.fromJson(Map<String, dynamic> json) => _$CreateCustomerAddressDtoFromJson(json);

  Map<String, dynamic> toJson() => _$CreateCustomerAddressDtoToJson(this);

  @override
  String toString() {
    return toJson().toString();
  }

}


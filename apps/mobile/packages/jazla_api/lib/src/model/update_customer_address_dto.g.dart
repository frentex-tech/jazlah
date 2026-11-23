// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'update_customer_address_dto.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

UpdateCustomerAddressDto _$UpdateCustomerAddressDtoFromJson(
  Map<String, dynamic> json,
) => $checkedCreate('UpdateCustomerAddressDto', json, ($checkedConvert) {
  final val = UpdateCustomerAddressDto(
    city: $checkedConvert('city', (v) => v as String?),
    district: $checkedConvert('district', (v) => v as String?),
    street: $checkedConvert('street', (v) => v as String?),
    building: $checkedConvert('building', (v) => v as String?),
    shortNationalAddress: $checkedConvert(
      'shortNationalAddress',
      (v) => v as String?,
    ),
    driverInstructions: $checkedConvert(
      'driverInstructions',
      (v) => v as String?,
    ),
    label: $checkedConvert('label', (v) => v as String?),
    location: $checkedConvert(
      'location',
      (v) => v == null ? null : GeoPointDto.fromJson(v as Map<String, dynamic>),
    ),
  );
  return val;
});

Map<String, dynamic> _$UpdateCustomerAddressDtoToJson(
  UpdateCustomerAddressDto instance,
) => <String, dynamic>{
  'city': ?instance.city,
  'district': ?instance.district,
  'street': ?instance.street,
  'building': ?instance.building,
  'shortNationalAddress': ?instance.shortNationalAddress,
  'driverInstructions': ?instance.driverInstructions,
  'label': ?instance.label,
  'location': ?instance.location?.toJson(),
};

// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'create_customer_address_dto.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

CreateCustomerAddressDto _$CreateCustomerAddressDtoFromJson(
  Map<String, dynamic> json,
) => $checkedCreate('CreateCustomerAddressDto', json, ($checkedConvert) {
  $checkKeys(json, requiredKeys: const ['label', 'location']);
  final val = CreateCustomerAddressDto(
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
    label: $checkedConvert('label', (v) => v as String),
    location: $checkedConvert(
      'location',
      (v) => GeoPointDto.fromJson(v as Map<String, dynamic>),
    ),
    isDefault: $checkedConvert('isDefault', (v) => v as bool? ?? false),
  );
  return val;
});

Map<String, dynamic> _$CreateCustomerAddressDtoToJson(
  CreateCustomerAddressDto instance,
) => <String, dynamic>{
  'city': ?instance.city,
  'district': ?instance.district,
  'street': ?instance.street,
  'building': ?instance.building,
  'shortNationalAddress': ?instance.shortNationalAddress,
  'driverInstructions': ?instance.driverInstructions,
  'label': instance.label,
  'location': instance.location.toJson(),
  'isDefault': ?instance.isDefault,
};

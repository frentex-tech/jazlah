// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'customer_address_response_dto.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

CustomerAddressResponseDto _$CustomerAddressResponseDtoFromJson(
  Map<String, dynamic> json,
) => $checkedCreate('CustomerAddressResponseDto', json, ($checkedConvert) {
  $checkKeys(
    json,
    requiredKeys: const [
      'id',
      'label',
      'location',
      'city',
      'district',
      'street',
      'building',
      'shortNationalAddress',
      'driverInstructions',
      'isDefault',
      'createdAt',
      'updatedAt',
    ],
  );
  final val = CustomerAddressResponseDto(
    id: $checkedConvert('id', (v) => v as String),
    label: $checkedConvert('label', (v) => v as String),
    location: $checkedConvert(
      'location',
      (v) => GeoPointDto.fromJson(v as Map<String, dynamic>),
    ),
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
    isDefault: $checkedConvert('isDefault', (v) => v as bool),
    createdAt: $checkedConvert('createdAt', (v) => DateTime.parse(v as String)),
    updatedAt: $checkedConvert('updatedAt', (v) => DateTime.parse(v as String)),
  );
  return val;
});

Map<String, dynamic> _$CustomerAddressResponseDtoToJson(
  CustomerAddressResponseDto instance,
) => <String, dynamic>{
  'id': instance.id,
  'label': instance.label,
  'location': instance.location.toJson(),
  'city': instance.city,
  'district': instance.district,
  'street': instance.street,
  'building': instance.building,
  'shortNationalAddress': instance.shortNationalAddress,
  'driverInstructions': instance.driverInstructions,
  'isDefault': instance.isDefault,
  'createdAt': instance.createdAt.toIso8601String(),
  'updatedAt': instance.updatedAt.toIso8601String(),
};

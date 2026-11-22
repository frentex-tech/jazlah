// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'order_address_response_dto.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

OrderAddressResponseDto _$OrderAddressResponseDtoFromJson(
  Map<String, dynamic> json,
) => $checkedCreate('OrderAddressResponseDto', json, ($checkedConvert) {
  $checkKeys(
    json,
    requiredKeys: const [
      'label',
      'location',
      'city',
      'district',
      'street',
      'building',
      'shortNationalAddress',
      'driverInstructions',
    ],
  );
  final val = OrderAddressResponseDto(
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
  );
  return val;
});

Map<String, dynamic> _$OrderAddressResponseDtoToJson(
  OrderAddressResponseDto instance,
) => <String, dynamic>{
  'label': instance.label,
  'location': instance.location.toJson(),
  'city': instance.city,
  'district': instance.district,
  'street': instance.street,
  'building': instance.building,
  'shortNationalAddress': instance.shortNationalAddress,
  'driverInstructions': instance.driverInstructions,
};

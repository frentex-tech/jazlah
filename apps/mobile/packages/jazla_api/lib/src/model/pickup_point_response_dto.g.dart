// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'pickup_point_response_dto.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

PickupPointResponseDto _$PickupPointResponseDtoFromJson(
  Map<String, dynamic> json,
) => $checkedCreate('PickupPointResponseDto', json, ($checkedConvert) {
  $checkKeys(
    json,
    requiredKeys: const ['name', 'address', 'location', 'phone', 'hours'],
  );
  final val = PickupPointResponseDto(
    name: $checkedConvert(
      'name',
      (v) => LocalizedTextResponseDto.fromJson(v as Map<String, dynamic>),
    ),
    address: $checkedConvert(
      'address',
      (v) => v == null
          ? null
          : LocalizedTextResponseDto.fromJson(v as Map<String, dynamic>),
    ),
    location: $checkedConvert(
      'location',
      (v) => v == null ? null : GeoPointDto.fromJson(v as Map<String, dynamic>),
    ),
    phone: $checkedConvert('phone', (v) => v as String?),
    hours: $checkedConvert(
      'hours',
      (v) =>
          v == null ? null : TimeWindowDto.fromJson(v as Map<String, dynamic>),
    ),
  );
  return val;
});

Map<String, dynamic> _$PickupPointResponseDtoToJson(
  PickupPointResponseDto instance,
) => <String, dynamic>{
  'name': instance.name.toJson(),
  'address': instance.address?.toJson(),
  'location': instance.location?.toJson(),
  'phone': instance.phone,
  'hours': instance.hours?.toJson(),
};

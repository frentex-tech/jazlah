// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'covering_zone_response_dto.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

CoveringZoneResponseDto _$CoveringZoneResponseDtoFromJson(
  Map<String, dynamic> json,
) => $checkedCreate('CoveringZoneResponseDto', json, ($checkedConvert) {
  $checkKeys(json, requiredKeys: const ['id', 'name', 'city']);
  final val = CoveringZoneResponseDto(
    id: $checkedConvert('id', (v) => v as String),
    name: $checkedConvert(
      'name',
      (v) => LocalizedTextResponseDto.fromJson(v as Map<String, dynamic>),
    ),
    city: $checkedConvert('city', (v) => v as String),
  );
  return val;
});

Map<String, dynamic> _$CoveringZoneResponseDtoToJson(
  CoveringZoneResponseDto instance,
) => <String, dynamic>{
  'id': instance.id,
  'name': instance.name.toJson(),
  'city': instance.city,
};

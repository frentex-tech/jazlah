// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'coverage_zone_response_dto.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

CoverageZoneResponseDto _$CoverageZoneResponseDtoFromJson(
  Map<String, dynamic> json,
) => $checkedCreate('CoverageZoneResponseDto', json, ($checkedConvert) {
  $checkKeys(
    json,
    requiredKeys: const [
      'id',
      'name',
      'city',
      'polygon',
      'isActive',
      'color',
      'createdAt',
      'updatedAt',
    ],
  );
  final val = CoverageZoneResponseDto(
    id: $checkedConvert('id', (v) => v as String),
    name: $checkedConvert(
      'name',
      (v) => LocalizedTextResponseDto.fromJson(v as Map<String, dynamic>),
    ),
    city: $checkedConvert('city', (v) => v as String),
    polygon: $checkedConvert(
      'polygon',
      (v) => GeoJsonPolygonDto.fromJson(v as Map<String, dynamic>),
    ),
    isActive: $checkedConvert('isActive', (v) => v as bool),
    color: $checkedConvert('color', (v) => v as String),
    createdAt: $checkedConvert('createdAt', (v) => DateTime.parse(v as String)),
    updatedAt: $checkedConvert('updatedAt', (v) => DateTime.parse(v as String)),
  );
  return val;
});

Map<String, dynamic> _$CoverageZoneResponseDtoToJson(
  CoverageZoneResponseDto instance,
) => <String, dynamic>{
  'id': instance.id,
  'name': instance.name.toJson(),
  'city': instance.city,
  'polygon': instance.polygon.toJson(),
  'isActive': instance.isActive,
  'color': instance.color,
  'createdAt': instance.createdAt.toIso8601String(),
  'updatedAt': instance.updatedAt.toIso8601String(),
};

// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'create_coverage_zone_dto.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

CreateCoverageZoneDto _$CreateCoverageZoneDtoFromJson(
  Map<String, dynamic> json,
) => $checkedCreate('CreateCoverageZoneDto', json, ($checkedConvert) {
  $checkKeys(json, requiredKeys: const ['name', 'city', 'polygon']);
  final val = CreateCoverageZoneDto(
    name: $checkedConvert(
      'name',
      (v) => LocalizedNameDto.fromJson(v as Map<String, dynamic>),
    ),
    city: $checkedConvert('city', (v) => v as String),
    polygon: $checkedConvert(
      'polygon',
      (v) => GeoJsonPolygonDto.fromJson(v as Map<String, dynamic>),
    ),
    isActive: $checkedConvert('isActive', (v) => v as bool? ?? true),
    color: $checkedConvert('color', (v) => v as String? ?? '#6A1A20'),
  );
  return val;
});

Map<String, dynamic> _$CreateCoverageZoneDtoToJson(
  CreateCoverageZoneDto instance,
) => <String, dynamic>{
  'name': instance.name.toJson(),
  'city': instance.city,
  'polygon': instance.polygon.toJson(),
  'isActive': ?instance.isActive,
  'color': ?instance.color,
};

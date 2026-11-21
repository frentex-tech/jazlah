// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'update_coverage_zone_dto.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

UpdateCoverageZoneDto _$UpdateCoverageZoneDtoFromJson(
  Map<String, dynamic> json,
) => $checkedCreate('UpdateCoverageZoneDto', json, ($checkedConvert) {
  final val = UpdateCoverageZoneDto(
    name: $checkedConvert(
      'name',
      (v) => v == null
          ? null
          : LocalizedNameDto.fromJson(v as Map<String, dynamic>),
    ),
    city: $checkedConvert('city', (v) => v as String?),
    polygon: $checkedConvert(
      'polygon',
      (v) => v == null
          ? null
          : GeoJsonPolygonDto.fromJson(v as Map<String, dynamic>),
    ),
    isActive: $checkedConvert('isActive', (v) => v as bool?),
    color: $checkedConvert('color', (v) => v as String?),
  );
  return val;
});

Map<String, dynamic> _$UpdateCoverageZoneDtoToJson(
  UpdateCoverageZoneDto instance,
) => <String, dynamic>{
  'name': ?instance.name?.toJson(),
  'city': ?instance.city,
  'polygon': ?instance.polygon?.toJson(),
  'isActive': ?instance.isActive,
  'color': ?instance.color,
};

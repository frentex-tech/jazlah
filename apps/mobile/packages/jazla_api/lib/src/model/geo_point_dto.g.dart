// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'geo_point_dto.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

GeoPointDto _$GeoPointDtoFromJson(Map<String, dynamic> json) =>
    $checkedCreate('GeoPointDto', json, ($checkedConvert) {
      $checkKeys(json, requiredKeys: const ['latitude', 'longitude']);
      final val = GeoPointDto(
        latitude: $checkedConvert('latitude', (v) => v as num),
        longitude: $checkedConvert('longitude', (v) => v as num),
      );
      return val;
    });

Map<String, dynamic> _$GeoPointDtoToJson(GeoPointDto instance) =>
    <String, dynamic>{
      'latitude': instance.latitude,
      'longitude': instance.longitude,
    };

// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'geo_json_polygon_dto.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

GeoJsonPolygonDto _$GeoJsonPolygonDtoFromJson(Map<String, dynamic> json) =>
    $checkedCreate('GeoJsonPolygonDto', json, ($checkedConvert) {
      $checkKeys(json, requiredKeys: const ['type', 'coordinates']);
      final val = GeoJsonPolygonDto(
        type: $checkedConvert(
          'type',
          (v) => $enumDecode(
            _$GeoJsonPolygonDtoTypeEnumEnumMap,
            v,
            unknownValue: GeoJsonPolygonDtoTypeEnum.unknownDefaultOpenApi,
          ),
        ),
        coordinates: $checkedConvert(
          'coordinates',
          (v) => (v as List<dynamic>)
              .map(
                (e) => (e as List<dynamic>)
                    .map(
                      (e) => (e as List<dynamic>).map((e) => e as num).toList(),
                    )
                    .toList(),
              )
              .toList(),
        ),
      );
      return val;
    });

Map<String, dynamic> _$GeoJsonPolygonDtoToJson(GeoJsonPolygonDto instance) =>
    <String, dynamic>{
      'type': _$GeoJsonPolygonDtoTypeEnumEnumMap[instance.type]!,
      'coordinates': instance.coordinates,
    };

const _$GeoJsonPolygonDtoTypeEnumEnumMap = {
  GeoJsonPolygonDtoTypeEnum.polygon: 'Polygon',
  GeoJsonPolygonDtoTypeEnum.unknownDefaultOpenApi: 'unknown_default_open_api',
};

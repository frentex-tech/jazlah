//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:jazla_api/src/model/localized_text_response_dto.dart';
import 'package:jazla_api/src/model/geo_json_polygon_dto.dart';
import 'package:json_annotation/json_annotation.dart';

part 'coverage_zone_response_dto.g.dart';


@JsonSerializable(
  checked: true,
  createToJson: true,
  disallowUnrecognizedKeys: false,
  explicitToJson: true,
)
class CoverageZoneResponseDto {
  /// Returns a new [CoverageZoneResponseDto] instance.
  CoverageZoneResponseDto({

    required  this.id,

    required  this.name,

    required  this.city,

    required  this.polygon,

    required  this.isActive,

    required  this.color,

    required  this.createdAt,

    required  this.updatedAt,
  });

      /// The zone id (UUID), for the `{id}` of /v1/admin/coverage-zones/{id}.
  @JsonKey(
    
    name: r'id',
    required: true,
    includeIfNull: false,
  )


  final String id;



      /// The zone name in Arabic and English.
  @JsonKey(
    
    name: r'name',
    required: true,
    includeIfNull: false,
  )


  final LocalizedTextResponseDto name;



      /// The city, as written.
  @JsonKey(
    
    name: r'city',
    required: true,
    includeIfNull: false,
  )


  final String city;



      /// The boundary, a GeoJSON polygon (coordinates rounded to 9 decimal places).
  @JsonKey(
    
    name: r'polygon',
    required: true,
    includeIfNull: false,
  )


  final GeoJsonPolygonDto polygon;



      /// Whether the zone counts in the coverage check.
  @JsonKey(
    
    name: r'isActive',
    required: true,
    includeIfNull: false,
  )


  final bool isActive;



      /// The zone colour on the dashboard map, `#RRGGBB`.
  @JsonKey(
    
    name: r'color',
    required: true,
    includeIfNull: false,
  )


  final String color;



      /// When the zone was created, UTC (ISO 8601).
  @JsonKey(
    
    name: r'createdAt',
    required: true,
    includeIfNull: false,
  )


  final DateTime createdAt;



      /// When the zone last changed, UTC (ISO 8601).
  @JsonKey(
    
    name: r'updatedAt',
    required: true,
    includeIfNull: false,
  )


  final DateTime updatedAt;





    @override
    bool operator ==(Object other) => identical(this, other) || other is CoverageZoneResponseDto &&
      other.id == id &&
      other.name == name &&
      other.city == city &&
      other.polygon == polygon &&
      other.isActive == isActive &&
      other.color == color &&
      other.createdAt == createdAt &&
      other.updatedAt == updatedAt;

    @override
    int get hashCode =>
        id.hashCode +
        name.hashCode +
        city.hashCode +
        polygon.hashCode +
        isActive.hashCode +
        color.hashCode +
        createdAt.hashCode +
        updatedAt.hashCode;

  factory CoverageZoneResponseDto.fromJson(Map<String, dynamic> json) => _$CoverageZoneResponseDtoFromJson(json);

  Map<String, dynamic> toJson() => _$CoverageZoneResponseDtoToJson(this);

  @override
  String toString() {
    return toJson().toString();
  }

}


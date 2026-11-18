//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:json_annotation/json_annotation.dart';

part 'geo_json_polygon_dto.g.dart';


@JsonSerializable(
  checked: true,
  createToJson: true,
  disallowUnrecognizedKeys: false,
  explicitToJson: true,
)
class GeoJsonPolygonDto {
  /// Returns a new [GeoJsonPolygonDto] instance.
  GeoJsonPolygonDto({

    required  this.type,

    required  this.coordinates,
  });

      /// Always `Polygon`.
  @JsonKey(
    
    name: r'type',
    required: true,
    includeIfNull: false,
  unknownEnumValue: GeoJsonPolygonDtoTypeEnum.unknownDefaultOpenApi,
  )


  final GeoJsonPolygonDtoTypeEnum type;



      /// The rings, as GeoJSON: the outer boundary first, then any holes. Each ring is a list of at least four `[longitude, latitude]` positions in degrees (WGS 84; longitude first), the last repeating the first. Edges must not cross (INVALID_POLYGON otherwise).
  @JsonKey(
    
    name: r'coordinates',
    required: true,
    includeIfNull: false,
  )


  final List<List<List<num>>> coordinates;





    @override
    bool operator ==(Object other) => identical(this, other) || other is GeoJsonPolygonDto &&
      other.type == type &&
      other.coordinates == coordinates;

    @override
    int get hashCode =>
        type.hashCode +
        coordinates.hashCode;

  factory GeoJsonPolygonDto.fromJson(Map<String, dynamic> json) => _$GeoJsonPolygonDtoFromJson(json);

  Map<String, dynamic> toJson() => _$GeoJsonPolygonDtoToJson(this);

  @override
  String toString() {
    return toJson().toString();
  }

}

/// Always `Polygon`.
enum GeoJsonPolygonDtoTypeEnum {
    /// Always `Polygon`.
@JsonValue(r'Polygon')
polygon(r'Polygon'),
    /// Always `Polygon`.
@JsonValue(r'unknown_default_open_api')
unknownDefaultOpenApi(r'unknown_default_open_api');

const GeoJsonPolygonDtoTypeEnum(this.value);

final String value;

@override
String toString() => value;
}



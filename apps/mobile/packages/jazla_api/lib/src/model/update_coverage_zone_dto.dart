//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:jazla_api/src/model/localized_name_dto.dart';
import 'package:jazla_api/src/model/geo_json_polygon_dto.dart';
import 'package:json_annotation/json_annotation.dart';

part 'update_coverage_zone_dto.g.dart';


@JsonSerializable(
  checked: true,
  createToJson: true,
  disallowUnrecognizedKeys: false,
  explicitToJson: true,
)
class UpdateCoverageZoneDto {
  /// Returns a new [UpdateCoverageZoneDto] instance.
  UpdateCoverageZoneDto({

     this.name,

     this.city,

     this.polygon,

     this.isActive,

     this.color,
  });

      /// The new name in Arabic and English, both together; left out: unchanged.
  @JsonKey(
    
    name: r'name',
    required: false,
    includeIfNull: false,
  )


  final LocalizedNameDto? name;



      /// The city, 2 to 50 characters; left out: unchanged.
  @JsonKey(
    
    name: r'city',
    required: false,
    includeIfNull: false,
  )


  final String? city;



      /// The new boundary, a GeoJSON polygon; left out: unchanged.
  @JsonKey(
    
    name: r'polygon',
    required: false,
    includeIfNull: false,
  )


  final GeoJsonPolygonDto? polygon;



      /// `false`: the zone stops counting in the coverage check at once (addresses in it show as not covered); `true`: it counts again. Left out: unchanged.
  @JsonKey(
    
    name: r'isActive',
    required: false,
    includeIfNull: false,
  )


  final bool? isActive;



      /// The new map colour, `#RRGGBB`; left out: unchanged.
  @JsonKey(
    
    name: r'color',
    required: false,
    includeIfNull: false,
  )


  final String? color;





    @override
    bool operator ==(Object other) => identical(this, other) || other is UpdateCoverageZoneDto &&
      other.name == name &&
      other.city == city &&
      other.polygon == polygon &&
      other.isActive == isActive &&
      other.color == color;

    @override
    int get hashCode =>
        name.hashCode +
        city.hashCode +
        polygon.hashCode +
        isActive.hashCode +
        color.hashCode;

  factory UpdateCoverageZoneDto.fromJson(Map<String, dynamic> json) => _$UpdateCoverageZoneDtoFromJson(json);

  Map<String, dynamic> toJson() => _$UpdateCoverageZoneDtoToJson(this);

  @override
  String toString() {
    return toJson().toString();
  }

}


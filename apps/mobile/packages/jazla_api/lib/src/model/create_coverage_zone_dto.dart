//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:jazla_api/src/model/localized_name_dto.dart';
import 'package:jazla_api/src/model/geo_json_polygon_dto.dart';
import 'package:json_annotation/json_annotation.dart';

part 'create_coverage_zone_dto.g.dart';


@JsonSerializable(
  checked: true,
  createToJson: true,
  disallowUnrecognizedKeys: false,
  explicitToJson: true,
)
class CreateCoverageZoneDto {
  /// Returns a new [CreateCoverageZoneDto] instance.
  CreateCoverageZoneDto({

    required  this.name,

    required  this.city,

    required  this.polygon,

     this.isActive = true,

     this.color = '#6A1A20',
  });

      /// The zone name in Arabic and English (a district or area name).
  @JsonKey(
    
    name: r'name',
    required: true,
    includeIfNull: false,
  )


  final LocalizedNameDto name;



      /// The city the zone is in, as written (Arabic expected): 2 to 50 characters after invisible format characters are removed and spaces trimmed.
  @JsonKey(
    
    name: r'city',
    required: true,
    includeIfNull: false,
  )


  final String city;



      /// The zone boundary, a GeoJSON polygon.
  @JsonKey(
    
    name: r'polygon',
    required: true,
    includeIfNull: false,
  )


  final GeoJsonPolygonDto polygon;



      /// Whether the zone counts in the coverage check at once; true when left out.
  @JsonKey(
    defaultValue: true,
    name: r'isActive',
    required: false,
    includeIfNull: false,
  )


  final bool? isActive;



      /// The zone colour on the dashboard map, `#RRGGBB` (either case); `#6A1A20` when left out.
  @JsonKey(
    defaultValue: '#6A1A20',
    name: r'color',
    required: false,
    includeIfNull: false,
  )


  final String? color;





    @override
    bool operator ==(Object other) => identical(this, other) || other is CreateCoverageZoneDto &&
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

  factory CreateCoverageZoneDto.fromJson(Map<String, dynamic> json) => _$CreateCoverageZoneDtoFromJson(json);

  Map<String, dynamic> toJson() => _$CreateCoverageZoneDtoToJson(this);

  @override
  String toString() {
    return toJson().toString();
  }

}


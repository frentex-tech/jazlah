//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:json_annotation/json_annotation.dart';

part 'geo_point_dto.g.dart';


@JsonSerializable(
  checked: true,
  createToJson: true,
  disallowUnrecognizedKeys: false,
  explicitToJson: true,
)
class GeoPointDto {
  /// Returns a new [GeoPointDto] instance.
  GeoPointDto({

    required  this.latitude,

    required  this.longitude,
  });

      /// Latitude in decimal degrees (WGS 84), -90 to 90; a JSON number.
          // minimum: -90
          // maximum: 90
  @JsonKey(
    
    name: r'latitude',
    required: true,
    includeIfNull: false,
  )


  final num latitude;



      /// Longitude in decimal degrees (WGS 84), -180 to 180; a JSON number.
          // minimum: -180
          // maximum: 180
  @JsonKey(
    
    name: r'longitude',
    required: true,
    includeIfNull: false,
  )


  final num longitude;





    @override
    bool operator ==(Object other) => identical(this, other) || other is GeoPointDto &&
      other.latitude == latitude &&
      other.longitude == longitude;

    @override
    int get hashCode =>
        latitude.hashCode +
        longitude.hashCode;

  factory GeoPointDto.fromJson(Map<String, dynamic> json) => _$GeoPointDtoFromJson(json);

  Map<String, dynamic> toJson() => _$GeoPointDtoToJson(this);

  @override
  String toString() {
    return toJson().toString();
  }

}


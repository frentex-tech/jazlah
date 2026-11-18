//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:jazla_api/src/model/localized_text_response_dto.dart';
import 'package:json_annotation/json_annotation.dart';

part 'covering_zone_response_dto.g.dart';


@JsonSerializable(
  checked: true,
  createToJson: true,
  disallowUnrecognizedKeys: false,
  explicitToJson: true,
)
class CoveringZoneResponseDto {
  /// Returns a new [CoveringZoneResponseDto] instance.
  CoveringZoneResponseDto({

    required  this.id,

    required  this.name,

    required  this.city,
  });

      /// The zone id (UUID).
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





    @override
    bool operator ==(Object other) => identical(this, other) || other is CoveringZoneResponseDto &&
      other.id == id &&
      other.name == name &&
      other.city == city;

    @override
    int get hashCode =>
        id.hashCode +
        name.hashCode +
        city.hashCode;

  factory CoveringZoneResponseDto.fromJson(Map<String, dynamic> json) => _$CoveringZoneResponseDtoFromJson(json);

  Map<String, dynamic> toJson() => _$CoveringZoneResponseDtoToJson(this);

  @override
  String toString() {
    return toJson().toString();
  }

}


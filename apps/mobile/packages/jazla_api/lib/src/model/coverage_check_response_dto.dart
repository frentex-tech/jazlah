//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:jazla_api/src/model/covering_zone_response_dto.dart';
import 'package:json_annotation/json_annotation.dart';

part 'coverage_check_response_dto.g.dart';


@JsonSerializable(
  checked: true,
  createToJson: true,
  disallowUnrecognizedKeys: false,
  explicitToJson: true,
)
class CoverageCheckResponseDto {
  /// Returns a new [CoverageCheckResponseDto] instance.
  CoverageCheckResponseDto({

    required  this.covered,

    required  this.zone,
  });

      /// Whether an active coverage zone covers the point.
  @JsonKey(
    
    name: r'covered',
    required: true,
    includeIfNull: false,
  )


  final bool covered;



      /// The zone covering the point; null when `covered` is false.
  @JsonKey(
    
    name: r'zone',
    required: true,
    includeIfNull: true,
  )


  final CoveringZoneResponseDto? zone;





    @override
    bool operator ==(Object other) => identical(this, other) || other is CoverageCheckResponseDto &&
      other.covered == covered &&
      other.zone == zone;

    @override
    int get hashCode =>
        covered.hashCode +
        (zone == null ? 0 : zone.hashCode);

  factory CoverageCheckResponseDto.fromJson(Map<String, dynamic> json) => _$CoverageCheckResponseDtoFromJson(json);

  Map<String, dynamic> toJson() => _$CoverageCheckResponseDtoToJson(this);

  @override
  String toString() {
    return toJson().toString();
  }

}


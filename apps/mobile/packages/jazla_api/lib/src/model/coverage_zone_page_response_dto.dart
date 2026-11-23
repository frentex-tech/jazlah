//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:jazla_api/src/model/coverage_zone_response_dto.dart';
import 'package:json_annotation/json_annotation.dart';

part 'coverage_zone_page_response_dto.g.dart';


@JsonSerializable(
  checked: true,
  createToJson: true,
  disallowUnrecognizedKeys: false,
  explicitToJson: true,
)
class CoverageZonePageResponseDto {
  /// Returns a new [CoverageZonePageResponseDto] instance.
  CoverageZonePageResponseDto({

    required  this.items,

    required  this.nextCursor,
  });

      /// The zones of this page, newest first; empty when none exist.
  @JsonKey(
    
    name: r'items',
    required: true,
    includeIfNull: false,
  )


  final List<CoverageZoneResponseDto> items;



      /// Send as `cursor` for the next page; null on the last page.
  @JsonKey(
    
    name: r'nextCursor',
    required: true,
    includeIfNull: true,
  )


  final String? nextCursor;





    @override
    bool operator ==(Object other) => identical(this, other) || other is CoverageZonePageResponseDto &&
      other.items == items &&
      other.nextCursor == nextCursor;

    @override
    int get hashCode =>
        items.hashCode +
        (nextCursor == null ? 0 : nextCursor.hashCode);

  factory CoverageZonePageResponseDto.fromJson(Map<String, dynamic> json) => _$CoverageZonePageResponseDtoFromJson(json);

  Map<String, dynamic> toJson() => _$CoverageZonePageResponseDtoToJson(this);

  @override
  String toString() {
    return toJson().toString();
  }

}


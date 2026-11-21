//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:jazla_api/src/model/reference_item_response_dto.dart';
import 'package:json_annotation/json_annotation.dart';

part 'reference_item_page_response_dto.g.dart';


@JsonSerializable(
  checked: true,
  createToJson: true,
  disallowUnrecognizedKeys: false,
  explicitToJson: true,
)
class ReferenceItemPageResponseDto {
  /// Returns a new [ReferenceItemPageResponseDto] instance.
  ReferenceItemPageResponseDto({

    required  this.items,

    required  this.nextCursor,
  });

      /// The entries of this page, newest first; empty when none match.
  @JsonKey(
    
    name: r'items',
    required: true,
    includeIfNull: false,
  )


  final List<ReferenceItemResponseDto> items;



      /// Send as `cursor` for the next page; null on the last page.
  @JsonKey(
    
    name: r'nextCursor',
    required: true,
    includeIfNull: true,
  )


  final String? nextCursor;





    @override
    bool operator ==(Object other) => identical(this, other) || other is ReferenceItemPageResponseDto &&
      other.items == items &&
      other.nextCursor == nextCursor;

    @override
    int get hashCode =>
        items.hashCode +
        (nextCursor == null ? 0 : nextCursor.hashCode);

  factory ReferenceItemPageResponseDto.fromJson(Map<String, dynamic> json) => _$ReferenceItemPageResponseDtoFromJson(json);

  Map<String, dynamic> toJson() => _$ReferenceItemPageResponseDtoToJson(this);

  @override
  String toString() {
    return toJson().toString();
  }

}


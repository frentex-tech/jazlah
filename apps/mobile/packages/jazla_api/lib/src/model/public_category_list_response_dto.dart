//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:jazla_api/src/model/reference_item_response_dto.dart';
import 'package:json_annotation/json_annotation.dart';

part 'public_category_list_response_dto.g.dart';


@JsonSerializable(
  checked: true,
  createToJson: true,
  disallowUnrecognizedKeys: false,
  explicitToJson: true,
)
class PublicCategoryListResponseDto {
  /// Returns a new [PublicCategoryListResponseDto] instance.
  PublicCategoryListResponseDto({

    required  this.items,
  });

      /// Every active category, by `sortOrder` (lower first), then oldest first; empty when there is none.
  @JsonKey(
    
    name: r'items',
    required: true,
    includeIfNull: false,
  )


  final List<ReferenceItemResponseDto> items;





    @override
    bool operator ==(Object other) => identical(this, other) || other is PublicCategoryListResponseDto &&
      other.items == items;

    @override
    int get hashCode =>
        items.hashCode;

  factory PublicCategoryListResponseDto.fromJson(Map<String, dynamic> json) => _$PublicCategoryListResponseDtoFromJson(json);

  Map<String, dynamic> toJson() => _$PublicCategoryListResponseDtoToJson(this);

  @override
  String toString() {
    return toJson().toString();
  }

}


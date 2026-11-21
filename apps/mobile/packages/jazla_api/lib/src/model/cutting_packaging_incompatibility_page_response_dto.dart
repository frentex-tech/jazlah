//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:jazla_api/src/model/cutting_packaging_incompatibility_response_dto.dart';
import 'package:json_annotation/json_annotation.dart';

part 'cutting_packaging_incompatibility_page_response_dto.g.dart';


@JsonSerializable(
  checked: true,
  createToJson: true,
  disallowUnrecognizedKeys: false,
  explicitToJson: true,
)
class CuttingPackagingIncompatibilityPageResponseDto {
  /// Returns a new [CuttingPackagingIncompatibilityPageResponseDto] instance.
  CuttingPackagingIncompatibilityPageResponseDto({

    required  this.items,

    required  this.nextCursor,
  });

      /// The rules of this page, newest first; empty when there are none.
  @JsonKey(
    
    name: r'items',
    required: true,
    includeIfNull: false,
  )


  final List<CuttingPackagingIncompatibilityResponseDto> items;



      /// Send as `cursor` for the next page; null on the last page.
  @JsonKey(
    
    name: r'nextCursor',
    required: true,
    includeIfNull: true,
  )


  final String? nextCursor;





    @override
    bool operator ==(Object other) => identical(this, other) || other is CuttingPackagingIncompatibilityPageResponseDto &&
      other.items == items &&
      other.nextCursor == nextCursor;

    @override
    int get hashCode =>
        items.hashCode +
        (nextCursor == null ? 0 : nextCursor.hashCode);

  factory CuttingPackagingIncompatibilityPageResponseDto.fromJson(Map<String, dynamic> json) => _$CuttingPackagingIncompatibilityPageResponseDtoFromJson(json);

  Map<String, dynamic> toJson() => _$CuttingPackagingIncompatibilityPageResponseDtoToJson(this);

  @override
  String toString() {
    return toJson().toString();
  }

}


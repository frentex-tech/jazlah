//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:jazla_api/src/model/localized_text_response_dto.dart';
import 'package:json_annotation/json_annotation.dart';

part 'reference_item_response_dto.g.dart';


@JsonSerializable(
  checked: true,
  createToJson: true,
  disallowUnrecognizedKeys: false,
  explicitToJson: true,
)
class ReferenceItemResponseDto {
  /// Returns a new [ReferenceItemResponseDto] instance.
  ReferenceItemResponseDto({

    required  this.id,

    required  this.name,

    required  this.isActive,

    required  this.sortOrder,

    required  this.imageUrl,

    required  this.createdAt,
  });

      /// The entry’s id (UUID).
  @JsonKey(
    
    name: r'id',
    required: true,
    includeIfNull: false,
  )


  final String id;



      /// The entry’s name in Arabic and English.
  @JsonKey(
    
    name: r'name',
    required: true,
    includeIfNull: false,
  )


  final LocalizedTextResponseDto name;



      /// Whether the entry can be chosen for a product; an inactive category also hides its products from the public. The public category list holds only active ones.
  @JsonKey(
    
    name: r'isActive',
    required: true,
    includeIfNull: false,
  )


  final bool isActive;



      /// A category’s display order, lower first; null for the other lists.
  @JsonKey(
    
    name: r'sortOrder',
    required: true,
    includeIfNull: true,
  )


  final num? sortOrder;



      /// A category’s image, its public URL; null without an image, and for the other lists.
  @JsonKey(
    
    name: r'imageUrl',
    required: true,
    includeIfNull: true,
  )


  final String? imageUrl;



      /// When the entry was added, UTC ISO 8601.
  @JsonKey(
    
    name: r'createdAt',
    required: true,
    includeIfNull: false,
  )


  final DateTime createdAt;





    @override
    bool operator ==(Object other) => identical(this, other) || other is ReferenceItemResponseDto &&
      other.id == id &&
      other.name == name &&
      other.isActive == isActive &&
      other.sortOrder == sortOrder &&
      other.imageUrl == imageUrl &&
      other.createdAt == createdAt;

    @override
    int get hashCode =>
        id.hashCode +
        name.hashCode +
        isActive.hashCode +
        (sortOrder == null ? 0 : sortOrder.hashCode) +
        (imageUrl == null ? 0 : imageUrl.hashCode) +
        createdAt.hashCode;

  factory ReferenceItemResponseDto.fromJson(Map<String, dynamic> json) => _$ReferenceItemResponseDtoFromJson(json);

  Map<String, dynamic> toJson() => _$ReferenceItemResponseDtoToJson(this);

  @override
  String toString() {
    return toJson().toString();
  }

}


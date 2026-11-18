//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:jazla_api/src/model/localized_name_dto.dart';
import 'package:json_annotation/json_annotation.dart';

part 'create_reference_item_dto.g.dart';


@JsonSerializable(
  checked: true,
  createToJson: true,
  disallowUnrecognizedKeys: false,
  explicitToJson: true,
)
class CreateReferenceItemDto {
  /// Returns a new [CreateReferenceItemDto] instance.
  CreateReferenceItemDto({

    required  this.name,

     this.sortOrder,

     this.imageMediaId,
  });

      /// The entry’s name in Arabic and English, as vendors and customers see it.
  @JsonKey(
    
    name: r'name',
    required: true,
    includeIfNull: false,
  )


  final LocalizedNameDto name;



      /// Categories only: the display order, lower first (0 by default). Another list refuses it (VALIDATION_FAILED `isOrderedList`).
          // minimum: 0
          // maximum: 100000
  @JsonKey(
    
    name: r'sortOrder',
    required: false,
    includeIfNull: false,
  )


  final num? sortOrder;



      /// Categories only: the image, the id (UUID) of a `catalog.category-image` file the signed-in admin uploaded and confirmed (MEDIA_NOT_FOUND, MEDIA_NOT_READY otherwise); left out or null: no image. Another list refuses it, even null (VALIDATION_FAILED `isCategoryList`).
  @JsonKey(
    
    name: r'imageMediaId',
    required: false,
    includeIfNull: false,
  )


  final String? imageMediaId;





    @override
    bool operator ==(Object other) => identical(this, other) || other is CreateReferenceItemDto &&
      other.name == name &&
      other.sortOrder == sortOrder &&
      other.imageMediaId == imageMediaId;

    @override
    int get hashCode =>
        name.hashCode +
        sortOrder.hashCode +
        (imageMediaId == null ? 0 : imageMediaId.hashCode);

  factory CreateReferenceItemDto.fromJson(Map<String, dynamic> json) => _$CreateReferenceItemDtoFromJson(json);

  Map<String, dynamic> toJson() => _$CreateReferenceItemDtoToJson(this);

  @override
  String toString() {
    return toJson().toString();
  }

}


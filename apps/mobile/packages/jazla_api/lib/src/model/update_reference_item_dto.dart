//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:jazla_api/src/model/localized_name_dto.dart';
import 'package:json_annotation/json_annotation.dart';

part 'update_reference_item_dto.g.dart';


@JsonSerializable(
  checked: true,
  createToJson: true,
  disallowUnrecognizedKeys: false,
  explicitToJson: true,
)
class UpdateReferenceItemDto {
  /// Returns a new [UpdateReferenceItemDto] instance.
  UpdateReferenceItemDto({

     this.name,

     this.isActive,

     this.sortOrder,

     this.imageMediaId,
  });

      /// The new name in Arabic and English, both together; left out: the name stays.
  @JsonKey(
    
    name: r'name',
    required: false,
    includeIfNull: false,
  )


  final LocalizedNameDto? name;



      /// `false`: the entry can no longer be chosen for a product (products using it keep it), and an inactive category hides its products from the public catalog; `true`: back in use. Left out: unchanged.
  @JsonKey(
    
    name: r'isActive',
    required: false,
    includeIfNull: false,
  )


  final bool? isActive;



      /// Categories only: the display order, lower first (0 by default). Another list refuses it (VALIDATION_FAILED `isOrderedList`).
          // minimum: 0
          // maximum: 100000
  @JsonKey(
    
    name: r'sortOrder',
    required: false,
    includeIfNull: false,
  )


  final num? sortOrder;



      /// Categories only: the new image, the id (UUID) of a `catalog.category-image` file the signed-in admin uploaded and confirmed (MEDIA_NOT_FOUND, MEDIA_NOT_READY otherwise); null removes the image; left out: unchanged. Another list refuses it, even null (VALIDATION_FAILED `isCategoryList`).
  @JsonKey(
    
    name: r'imageMediaId',
    required: false,
    includeIfNull: false,
  )


  final String? imageMediaId;





    @override
    bool operator ==(Object other) => identical(this, other) || other is UpdateReferenceItemDto &&
      other.name == name &&
      other.isActive == isActive &&
      other.sortOrder == sortOrder &&
      other.imageMediaId == imageMediaId;

    @override
    int get hashCode =>
        name.hashCode +
        isActive.hashCode +
        sortOrder.hashCode +
        (imageMediaId == null ? 0 : imageMediaId.hashCode);

  factory UpdateReferenceItemDto.fromJson(Map<String, dynamic> json) => _$UpdateReferenceItemDtoFromJson(json);

  Map<String, dynamic> toJson() => _$UpdateReferenceItemDtoToJson(this);

  @override
  String toString() {
    return toJson().toString();
  }

}


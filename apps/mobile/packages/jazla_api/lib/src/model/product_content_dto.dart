//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:jazla_api/src/model/localized_name_dto.dart';
import 'package:jazla_api/src/model/product_cutting_dto.dart';
import 'package:jazla_api/src/model/product_size_dto.dart';
import 'package:jazla_api/src/model/product_packaging_dto.dart';
import 'package:jazla_api/src/model/localized_description_dto.dart';
import 'package:json_annotation/json_annotation.dart';

part 'product_content_dto.g.dart';


@JsonSerializable(
  checked: true,
  createToJson: true,
  disallowUnrecognizedKeys: false,
  explicitToJson: true,
)
class ProductContentDto {
  /// Returns a new [ProductContentDto] instance.
  ProductContentDto({

    required  this.name,

     this.description,

    required  this.categoryId,

     this.meatTypeId,

    required  this.imageMediaIds,

    required  this.sizes,

    required  this.cuttings,

    required  this.packagings,

    required  this.exclusionItemIds,
  });

      /// The product name in Arabic and English, as customers see it.
  @JsonKey(
    
    name: r'name',
    required: true,
    includeIfNull: false,
  )


  final LocalizedNameDto name;



      /// An optional longer description in Arabic, English, both or neither; left out: none. The whole content is replaced, so on an edit send the description again to keep it.
  @JsonKey(
    
    name: r'description',
    required: false,
    includeIfNull: false,
  )


  final LocalizedDescriptionDto? description;



      /// The id (UUID) of an active category (GET /v1/public/categories); another one is VALIDATION_FAILED `isActiveCategory`.
  @JsonKey(
    
    name: r'categoryId',
    required: true,
    includeIfNull: false,
  )


  final String categoryId;



      /// The id (UUID) of an active meat type, or null or left out for none; an inactive or unknown one is VALIDATION_FAILED `isActiveMeatType`.
  @JsonKey(
    
    name: r'meatTypeId',
    required: false,
    includeIfNull: false,
  )


  final String? meatTypeId;



      /// The images, as media ids (UUIDs) in display order, the first is the cover; at most 10, no repeats. Each new one is a `catalog.product-image` upload the signed-in user made and confirmed (MEDIA_NOT_FOUND, MEDIA_NOT_READY otherwise); the product’s current images may be kept as they are. Empty is allowed on a draft; submitting needs at least one.
  @JsonKey(
    
    name: r'imageMediaIds',
    required: true,
    includeIfNull: false,
  )


  final List<String> imageMediaIds;



      /// The sizes, in display order, at most 20. An existing size is kept by sending its `id` (at most once, VALIDATION_FAILED `isNotRepeated` on `sizes.<i>.id`; an id not of this product is `isSizeOfProduct`) and keeps its live price; one left out is removed; one without `id` is new. Empty is allowed on a draft; submitting needs at least one.
  @JsonKey(
    
    name: r'sizes',
    required: true,
    includeIfNull: false,
  )


  final List<ProductSizeDto> sizes;



      /// The cutting styles offered, in display order, at most 30, each at most once (VALIDATION_FAILED `isNotRepeated` on `cuttings.<i>.cuttingStyleId`). Empty: no cutting choice.
  @JsonKey(
    
    name: r'cuttings',
    required: true,
    includeIfNull: false,
  )


  final List<ProductCuttingDto> cuttings;



      /// The packagings offered with their extra prices, each packaging at most once (VALIDATION_FAILED `isNotRepeated` on `packagings.<i>.packaging`). Empty: no packaging choice.
  @JsonKey(
    
    name: r'packagings',
    required: true,
    includeIfNull: false,
  )


  final List<ProductPackagingDto> packagings;



      /// The ids (UUIDs) of the active \"without\" items a customer may ask to leave out, at most 30, no repeats; an inactive or unknown one is VALIDATION_FAILED `isActiveExclusionItem`.
  @JsonKey(
    
    name: r'exclusionItemIds',
    required: true,
    includeIfNull: false,
  )


  final List<String> exclusionItemIds;





    @override
    bool operator ==(Object other) => identical(this, other) || other is ProductContentDto &&
      other.name == name &&
      other.description == description &&
      other.categoryId == categoryId &&
      other.meatTypeId == meatTypeId &&
      other.imageMediaIds == imageMediaIds &&
      other.sizes == sizes &&
      other.cuttings == cuttings &&
      other.packagings == packagings &&
      other.exclusionItemIds == exclusionItemIds;

    @override
    int get hashCode =>
        name.hashCode +
        description.hashCode +
        categoryId.hashCode +
        (meatTypeId == null ? 0 : meatTypeId.hashCode) +
        imageMediaIds.hashCode +
        sizes.hashCode +
        cuttings.hashCode +
        packagings.hashCode +
        exclusionItemIds.hashCode;

  factory ProductContentDto.fromJson(Map<String, dynamic> json) => _$ProductContentDtoFromJson(json);

  Map<String, dynamic> toJson() => _$ProductContentDtoToJson(this);

  @override
  String toString() {
    return toJson().toString();
  }

}


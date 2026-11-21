//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:jazla_api/src/model/localized_text_response_dto.dart';
import 'package:jazla_api/src/model/optional_localized_text_response_dto.dart';
import 'package:jazla_api/src/model/product_image_response_dto.dart';
import 'package:jazla_api/src/model/product_cutting_response_dto.dart';
import 'package:jazla_api/src/model/product_packaging_response_dto.dart';
import 'package:jazla_api/src/model/product_size_response_dto.dart';
import 'package:json_annotation/json_annotation.dart';

part 'product_content_response_dto.g.dart';


@JsonSerializable(
  checked: true,
  createToJson: true,
  disallowUnrecognizedKeys: false,
  explicitToJson: true,
)
class ProductContentResponseDto {
  /// Returns a new [ProductContentResponseDto] instance.
  ProductContentResponseDto({

    required  this.name,

    required  this.description,

    required  this.categoryId,

    required  this.meatTypeId,

    required  this.images,

    required  this.sizes,

    required  this.cuttings,

    required  this.packagings,

    required  this.exclusionItemIds,
  });

      /// The proposed name in Arabic and English.
  @JsonKey(
    
    name: r'name',
    required: true,
    includeIfNull: false,
  )


  final LocalizedTextResponseDto name;



      /// The proposed description in Arabic and English, each null when absent.
  @JsonKey(
    
    name: r'description',
    required: true,
    includeIfNull: false,
  )


  final OptionalLocalizedTextResponseDto description;



      /// The id (UUID) of the proposed category.
  @JsonKey(
    
    name: r'categoryId',
    required: true,
    includeIfNull: false,
  )


  final String categoryId;



      /// The id (UUID) of the proposed meat type; null for none.
  @JsonKey(
    
    name: r'meatTypeId',
    required: true,
    includeIfNull: true,
  )


  final String? meatTypeId;



      /// The proposed images in display order, the first is the cover.
  @JsonKey(
    
    name: r'images',
    required: true,
    includeIfNull: false,
  )


  final List<ProductImageResponseDto> images;



      /// The proposed sizes in display order; a size with an id is an existing one (its live price is kept on approval), a size with a null id is new.
  @JsonKey(
    
    name: r'sizes',
    required: true,
    includeIfNull: false,
  )


  final List<ProductSizeResponseDto> sizes;



      /// The proposed cutting styles, by id (names are null here).
  @JsonKey(
    
    name: r'cuttings',
    required: true,
    includeIfNull: false,
  )


  final List<ProductCuttingResponseDto> cuttings;



      /// The proposed packagings, with their extra prices.
  @JsonKey(
    
    name: r'packagings',
    required: true,
    includeIfNull: false,
  )


  final List<ProductPackagingResponseDto> packagings;



      /// The ids (UUIDs) of the proposed \"without\" items.
  @JsonKey(
    
    name: r'exclusionItemIds',
    required: true,
    includeIfNull: false,
  )


  final List<String> exclusionItemIds;





    @override
    bool operator ==(Object other) => identical(this, other) || other is ProductContentResponseDto &&
      other.name == name &&
      other.description == description &&
      other.categoryId == categoryId &&
      other.meatTypeId == meatTypeId &&
      other.images == images &&
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
        images.hashCode +
        sizes.hashCode +
        cuttings.hashCode +
        packagings.hashCode +
        exclusionItemIds.hashCode;

  factory ProductContentResponseDto.fromJson(Map<String, dynamic> json) => _$ProductContentResponseDtoFromJson(json);

  Map<String, dynamic> toJson() => _$ProductContentResponseDtoToJson(this);

  @override
  String toString() {
    return toJson().toString();
  }

}


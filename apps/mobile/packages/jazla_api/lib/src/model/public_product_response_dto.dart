//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:jazla_api/src/model/localized_text_response_dto.dart';
import 'package:jazla_api/src/model/named_reference_response_dto.dart';
import 'package:jazla_api/src/model/public_product_size_response_dto.dart';
import 'package:jazla_api/src/model/optional_localized_text_response_dto.dart';
import 'package:jazla_api/src/model/product_image_response_dto.dart';
import 'package:jazla_api/src/model/incompatible_pair_response_dto.dart';
import 'package:jazla_api/src/model/product_packaging_response_dto.dart';
import 'package:jazla_api/src/model/product_vendor_response_dto.dart';
import 'package:jazla_api/src/model/public_product_cutting_response_dto.dart';
import 'package:json_annotation/json_annotation.dart';

part 'public_product_response_dto.g.dart';


@JsonSerializable(
  checked: true,
  createToJson: true,
  disallowUnrecognizedKeys: false,
  explicitToJson: true,
)
class PublicProductResponseDto {
  /// Returns a new [PublicProductResponseDto] instance.
  PublicProductResponseDto({

    required  this.id,

    required  this.vendor,

    required  this.name,

    required  this.description,

    required  this.category,

    required  this.meatType,

    required  this.fulfilment,

    required  this.isAvailable,

    required  this.images,

    required  this.sizes,

    required  this.defaultSizeId,

    required  this.cuttings,

    required  this.packagings,

    required  this.exclusions,

    required  this.incompatiblePairs,

    required  this.minPriceHalalas,
  });

      /// The product id (UUID).
  @JsonKey(
    
    name: r'id',
    required: true,
    includeIfNull: false,
  )


  final String id;



      /// The vendor selling the product.
  @JsonKey(
    
    name: r'vendor',
    required: true,
    includeIfNull: false,
  )


  final ProductVendorResponseDto vendor;



      /// The product name in Arabic and English.
  @JsonKey(
    
    name: r'name',
    required: true,
    includeIfNull: false,
  )


  final LocalizedTextResponseDto name;



      /// The description in Arabic and English, each null when absent.
  @JsonKey(
    
    name: r'description',
    required: true,
    includeIfNull: false,
  )


  final OptionalLocalizedTextResponseDto description;



      /// The product’s category, with its name.
  @JsonKey(
    
    name: r'category',
    required: true,
    includeIfNull: false,
  )


  final NamedReferenceResponseDto category;



      /// The product’s meat type, with its name; null when it has none.
  @JsonKey(
    
    name: r'meatType',
    required: true,
    includeIfNull: true,
  )


  final NamedReferenceResponseDto? meatType;



      /// How the product reaches the customer: `delivery`, `pickup` or `both`.
  @JsonKey(
    
    name: r'fulfilment',
    required: true,
    includeIfNull: false,
  unknownEnumValue: PublicProductResponseDtoFulfilmentEnum.unknownDefaultOpenApi,
  )


  final PublicProductResponseDtoFulfilmentEnum fulfilment;



      /// Whether the product can be ordered now; `false`: out of stock (the page shows it, nothing can be added). An unavailable product is left out of the public list.
  @JsonKey(
    
    name: r'isAvailable',
    required: true,
    includeIfNull: false,
  )


  final bool isAvailable;



      /// The images in display order, the first is the cover.
  @JsonKey(
    
    name: r'images',
    required: true,
    includeIfNull: false,
  )


  final List<ProductImageResponseDto> images;



      /// The sizes to choose from, in display order, each with its approximate weight, price and availability; at least one.
  @JsonKey(
    
    name: r'sizes',
    required: true,
    includeIfNull: false,
  )


  final List<PublicProductSizeResponseDto> sizes;



      /// The size chosen when the page opens: the first available size in display order; null when no size is available.
  @JsonKey(
    
    name: r'defaultSizeId',
    required: true,
    includeIfNull: true,
  )


  final String? defaultSizeId;



      /// The cutting styles to choose from, with their extra prices; empty when there is no cutting choice. With any, the customer must choose one (OPTION_REQUIRED).
  @JsonKey(
    
    name: r'cuttings',
    required: true,
    includeIfNull: false,
  )


  final List<PublicProductCuttingResponseDto> cuttings;



      /// The packagings to choose from (`trays`, `bags`, `vacuum`, `none`), with their extra prices; empty when there is no packaging choice.
  @JsonKey(
    
    name: r'packagings',
    required: true,
    includeIfNull: false,
  )


  final List<ProductPackagingResponseDto> packagings;



      /// The \"without\" items the customer may ask to leave out.
  @JsonKey(
    
    name: r'exclusions',
    required: true,
    includeIfNull: false,
  )


  final List<NamedReferenceResponseDto> exclusions;



      /// Cutting style and packaging pairs among this product’s options that may not be chosen together (admin rules); the cart’s line price (CRT-API-1) will refuse one (INCOMPATIBLE_CUTTING_PACKAGING). Empty when none applies.
  @JsonKey(
    
    name: r'incompatiblePairs',
    required: true,
    includeIfNull: false,
  )


  final List<IncompatiblePairResponseDto> incompatiblePairs;



      /// The lowest size price in halalas, VAT included (`95000` is 950.00 SAR): the \"from\" price.
  @JsonKey(
    
    name: r'minPriceHalalas',
    required: true,
    includeIfNull: false,
  )


  final num minPriceHalalas;





    @override
    bool operator ==(Object other) => identical(this, other) || other is PublicProductResponseDto &&
      other.id == id &&
      other.vendor == vendor &&
      other.name == name &&
      other.description == description &&
      other.category == category &&
      other.meatType == meatType &&
      other.fulfilment == fulfilment &&
      other.isAvailable == isAvailable &&
      other.images == images &&
      other.sizes == sizes &&
      other.defaultSizeId == defaultSizeId &&
      other.cuttings == cuttings &&
      other.packagings == packagings &&
      other.exclusions == exclusions &&
      other.incompatiblePairs == incompatiblePairs &&
      other.minPriceHalalas == minPriceHalalas;

    @override
    int get hashCode =>
        id.hashCode +
        vendor.hashCode +
        name.hashCode +
        description.hashCode +
        category.hashCode +
        (meatType == null ? 0 : meatType.hashCode) +
        fulfilment.hashCode +
        isAvailable.hashCode +
        images.hashCode +
        sizes.hashCode +
        (defaultSizeId == null ? 0 : defaultSizeId.hashCode) +
        cuttings.hashCode +
        packagings.hashCode +
        exclusions.hashCode +
        incompatiblePairs.hashCode +
        minPriceHalalas.hashCode;

  factory PublicProductResponseDto.fromJson(Map<String, dynamic> json) => _$PublicProductResponseDtoFromJson(json);

  Map<String, dynamic> toJson() => _$PublicProductResponseDtoToJson(this);

  @override
  String toString() {
    return toJson().toString();
  }

}

/// How the product reaches the customer: `delivery`, `pickup` or `both`.
enum PublicProductResponseDtoFulfilmentEnum {
    /// How the product reaches the customer: `delivery`, `pickup` or `both`.
@JsonValue(r'delivery')
delivery(r'delivery'),
    /// How the product reaches the customer: `delivery`, `pickup` or `both`.
@JsonValue(r'pickup')
pickup(r'pickup'),
    /// How the product reaches the customer: `delivery`, `pickup` or `both`.
@JsonValue(r'both')
both(r'both'),
    /// How the product reaches the customer: `delivery`, `pickup` or `both`.
@JsonValue(r'unknown_default_open_api')
unknownDefaultOpenApi(r'unknown_default_open_api');

const PublicProductResponseDtoFulfilmentEnum(this.value);

final String value;

@override
String toString() => value;
}



//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:jazla_api/src/model/localized_text_response_dto.dart';
import 'package:jazla_api/src/model/named_reference_response_dto.dart';
import 'package:jazla_api/src/model/optional_localized_text_response_dto.dart';
import 'package:jazla_api/src/model/product_image_response_dto.dart';
import 'package:jazla_api/src/model/product_cutting_response_dto.dart';
import 'package:jazla_api/src/model/product_packaging_response_dto.dart';
import 'package:jazla_api/src/model/product_vendor_response_dto.dart';
import 'package:jazla_api/src/model/product_size_response_dto.dart';
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

    required  this.images,

    required  this.sizes,

    required  this.cuttings,

    required  this.packagings,

    required  this.exclusions,

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



      /// The images in display order, the first is the cover.
  @JsonKey(
    
    name: r'images',
    required: true,
    includeIfNull: false,
  )


  final List<ProductImageResponseDto> images;



      /// The sizes to choose from, in display order, each with its approximate weight and price; at least one.
  @JsonKey(
    
    name: r'sizes',
    required: true,
    includeIfNull: false,
  )


  final List<ProductSizeResponseDto> sizes;



      /// The cutting styles to choose from, with their extra prices; empty when there is no cutting choice.
  @JsonKey(
    
    name: r'cuttings',
    required: true,
    includeIfNull: false,
  )


  final List<ProductCuttingResponseDto> cuttings;



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
      other.images == images &&
      other.sizes == sizes &&
      other.cuttings == cuttings &&
      other.packagings == packagings &&
      other.exclusions == exclusions &&
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
        images.hashCode +
        sizes.hashCode +
        cuttings.hashCode +
        packagings.hashCode +
        exclusions.hashCode +
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



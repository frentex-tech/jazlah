//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:jazla_api/src/model/localized_text_response_dto.dart';
import 'package:jazla_api/src/model/product_vendor_response_dto.dart';
import 'package:json_annotation/json_annotation.dart';

part 'product_card_response_dto.g.dart';


@JsonSerializable(
  checked: true,
  createToJson: true,
  disallowUnrecognizedKeys: false,
  explicitToJson: true,
)
class ProductCardResponseDto {
  /// Returns a new [ProductCardResponseDto] instance.
  ProductCardResponseDto({

    required  this.id,

    required  this.vendor,

    required  this.name,

    required  this.categoryId,

    required  this.meatTypeId,

    required  this.status,

    required  this.isAvailable,

    required  this.minPriceHalalas,

    required  this.coverUrl,

    required  this.createdAt,
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



      /// The id (UUID) of the product’s category.
  @JsonKey(
    
    name: r'categoryId',
    required: true,
    includeIfNull: false,
  )


  final String categoryId;



      /// The id (UUID) of the product’s meat type; null when it has none.
  @JsonKey(
    
    name: r'meatTypeId',
    required: true,
    includeIfNull: true,
  )


  final String? meatTypeId;



      /// Where the product is: `draft` (being written, not submitted), `pending_review` (waiting for admin review, not editable), `published` (live; content edits go through change requests), `rejected` (sent back with a reason; edit and submit again). Public lists hold only `published`.
  @JsonKey(
    
    name: r'status',
    required: true,
    includeIfNull: false,
  unknownEnumValue: ProductCardResponseDtoStatusEnum.unknownDefaultOpenApi,
  )


  final ProductCardResponseDtoStatusEnum status;



      /// Whether the product can be ordered now (the vendor’s on and off switch). Public lists hold only available products.
  @JsonKey(
    
    name: r'isAvailable',
    required: true,
    includeIfNull: false,
  )


  final bool isAvailable;



      /// The lowest size price in halalas, VAT included (`95000` is 950.00 SAR), the \"from\" price of the card; null while the product has no size (a draft).
  @JsonKey(
    
    name: r'minPriceHalalas',
    required: true,
    includeIfNull: true,
  )


  final num? minPriceHalalas;



      /// The public URL of the first image, the cover; null while the product has no image.
  @JsonKey(
    
    name: r'coverUrl',
    required: true,
    includeIfNull: true,
  )


  final String? coverUrl;



      /// When the product was created, UTC ISO 8601; lists are ordered by it, newest first.
  @JsonKey(
    
    name: r'createdAt',
    required: true,
    includeIfNull: false,
  )


  final DateTime createdAt;





    @override
    bool operator ==(Object other) => identical(this, other) || other is ProductCardResponseDto &&
      other.id == id &&
      other.vendor == vendor &&
      other.name == name &&
      other.categoryId == categoryId &&
      other.meatTypeId == meatTypeId &&
      other.status == status &&
      other.isAvailable == isAvailable &&
      other.minPriceHalalas == minPriceHalalas &&
      other.coverUrl == coverUrl &&
      other.createdAt == createdAt;

    @override
    int get hashCode =>
        id.hashCode +
        vendor.hashCode +
        name.hashCode +
        categoryId.hashCode +
        (meatTypeId == null ? 0 : meatTypeId.hashCode) +
        status.hashCode +
        isAvailable.hashCode +
        (minPriceHalalas == null ? 0 : minPriceHalalas.hashCode) +
        (coverUrl == null ? 0 : coverUrl.hashCode) +
        createdAt.hashCode;

  factory ProductCardResponseDto.fromJson(Map<String, dynamic> json) => _$ProductCardResponseDtoFromJson(json);

  Map<String, dynamic> toJson() => _$ProductCardResponseDtoToJson(this);

  @override
  String toString() {
    return toJson().toString();
  }

}

/// Where the product is: `draft` (being written, not submitted), `pending_review` (waiting for admin review, not editable), `published` (live; content edits go through change requests), `rejected` (sent back with a reason; edit and submit again). Public lists hold only `published`.
enum ProductCardResponseDtoStatusEnum {
    /// Where the product is: `draft` (being written, not submitted), `pending_review` (waiting for admin review, not editable), `published` (live; content edits go through change requests), `rejected` (sent back with a reason; edit and submit again). Public lists hold only `published`.
@JsonValue(r'draft')
draft(r'draft'),
    /// Where the product is: `draft` (being written, not submitted), `pending_review` (waiting for admin review, not editable), `published` (live; content edits go through change requests), `rejected` (sent back with a reason; edit and submit again). Public lists hold only `published`.
@JsonValue(r'pending_review')
pendingReview(r'pending_review'),
    /// Where the product is: `draft` (being written, not submitted), `pending_review` (waiting for admin review, not editable), `published` (live; content edits go through change requests), `rejected` (sent back with a reason; edit and submit again). Public lists hold only `published`.
@JsonValue(r'published')
published(r'published'),
    /// Where the product is: `draft` (being written, not submitted), `pending_review` (waiting for admin review, not editable), `published` (live; content edits go through change requests), `rejected` (sent back with a reason; edit and submit again). Public lists hold only `published`.
@JsonValue(r'rejected')
rejected(r'rejected'),
    /// Where the product is: `draft` (being written, not submitted), `pending_review` (waiting for admin review, not editable), `published` (live; content edits go through change requests), `rejected` (sent back with a reason; edit and submit again). Public lists hold only `published`.
@JsonValue(r'unknown_default_open_api')
unknownDefaultOpenApi(r'unknown_default_open_api');

const ProductCardResponseDtoStatusEnum(this.value);

final String value;

@override
String toString() => value;
}



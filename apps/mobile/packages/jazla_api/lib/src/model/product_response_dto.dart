//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:jazla_api/src/model/localized_text_response_dto.dart';
import 'package:jazla_api/src/model/named_reference_response_dto.dart';
import 'package:jazla_api/src/model/optional_localized_text_response_dto.dart';
import 'package:jazla_api/src/model/product_image_response_dto.dart';
import 'package:jazla_api/src/model/product_change_request_response_dto.dart';
import 'package:jazla_api/src/model/product_cutting_response_dto.dart';
import 'package:jazla_api/src/model/product_packaging_response_dto.dart';
import 'package:jazla_api/src/model/product_size_response_dto.dart';
import 'package:json_annotation/json_annotation.dart';

part 'product_response_dto.g.dart';


@JsonSerializable(
  checked: true,
  createToJson: true,
  disallowUnrecognizedKeys: false,
  explicitToJson: true,
)
class ProductResponseDto {
  /// Returns a new [ProductResponseDto] instance.
  ProductResponseDto({

    required  this.id,

    required  this.vendorId,

    required  this.status,

    required  this.isAvailable,

    required  this.fulfilment,

    required  this.name,

    required  this.description,

    required  this.category,

    required  this.meatType,

    required  this.images,

    required  this.sizes,

    required  this.cuttings,

    required  this.packagings,

    required  this.exclusions,

    required  this.minPriceHalalas,

    required  this.rejectionReason,

    required  this.submittedAt,

    required  this.reviewedAt,

    required  this.publishedAt,

    required  this.createdAt,

    required  this.updatedAt,

    required  this.changeRequest,
  });

      /// The product id (UUID).
  @JsonKey(
    
    name: r'id',
    required: true,
    includeIfNull: false,
  )


  final String id;



      /// The id (UUID) of the vendor that sells it (the platform vendor for JAZLA’s own products).
  @JsonKey(
    
    name: r'vendorId',
    required: true,
    includeIfNull: false,
  )


  final String vendorId;



      /// Where the product is: `draft` (being written; submit it), `pending_review` (waiting for admin review; nothing can be changed), `published` (live; a vendor’s content edits become change requests, availability, fulfilment and prices change at once), `rejected` (sent back with `rejectionReason`; edit and submit again). Moves: draft or rejected to pending_review (vendor submits), pending_review to published or rejected (admin decides), draft to published (admin, JAZLA products only); a published product stays published.
  @JsonKey(
    
    name: r'status',
    required: true,
    includeIfNull: false,
  unknownEnumValue: ProductResponseDtoStatusEnum.unknownDefaultOpenApi,
  )


  final ProductResponseDtoStatusEnum status;



      /// Whether the product can be ordered now (the on and off switch); an unavailable product is hidden from the public catalog.
  @JsonKey(
    
    name: r'isAvailable',
    required: true,
    includeIfNull: false,
  )


  final bool isAvailable;



      /// How the product reaches the customer: `delivery`, `pickup` or `both`.
  @JsonKey(
    
    name: r'fulfilment',
    required: true,
    includeIfNull: false,
  unknownEnumValue: ProductResponseDtoFulfilmentEnum.unknownDefaultOpenApi,
  )


  final ProductResponseDtoFulfilmentEnum fulfilment;



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



      /// The images in display order, the first is the cover.
  @JsonKey(
    
    name: r'images',
    required: true,
    includeIfNull: false,
  )


  final List<ProductImageResponseDto> images;



      /// The sizes in display order, with their live prices.
  @JsonKey(
    
    name: r'sizes',
    required: true,
    includeIfNull: false,
  )


  final List<ProductSizeResponseDto> sizes;



      /// The cutting styles offered, in display order, with their names and extra prices.
  @JsonKey(
    
    name: r'cuttings',
    required: true,
    includeIfNull: false,
  )


  final List<ProductCuttingResponseDto> cuttings;



      /// The packagings offered (`trays`, `bags`, `vacuum`, `none`), with their extra prices.
  @JsonKey(
    
    name: r'packagings',
    required: true,
    includeIfNull: false,
  )


  final List<ProductPackagingResponseDto> packagings;



      /// The \"without\" items a customer may ask to leave out, with their names.
  @JsonKey(
    
    name: r'exclusions',
    required: true,
    includeIfNull: false,
  )


  final List<NamedReferenceResponseDto> exclusions;



      /// The lowest size price in halalas, VAT included (`95000` is 950.00 SAR); null while there is no size.
  @JsonKey(
    
    name: r'minPriceHalalas',
    required: true,
    includeIfNull: true,
  )


  final num? minPriceHalalas;



      /// The admin’s reason for sending the product back, for the vendor to read; set only while `status` is `rejected`, otherwise null.
  @JsonKey(
    
    name: r'rejectionReason',
    required: true,
    includeIfNull: true,
  )


  final String? rejectionReason;



      /// When the vendor last sent it to review, UTC ISO 8601; null if never submitted (JAZLA products are never submitted).
  @JsonKey(
    
    name: r'submittedAt',
    required: true,
    includeIfNull: true,
  )


  final DateTime? submittedAt;



      /// When an admin last approved, rejected or (JAZLA products) published it, UTC ISO 8601; null before.
  @JsonKey(
    
    name: r'reviewedAt',
    required: true,
    includeIfNull: true,
  )


  final DateTime? reviewedAt;



      /// When it was published, UTC ISO 8601; null until then.
  @JsonKey(
    
    name: r'publishedAt',
    required: true,
    includeIfNull: true,
  )


  final DateTime? publishedAt;



      /// When the product was created, UTC ISO 8601.
  @JsonKey(
    
    name: r'createdAt',
    required: true,
    includeIfNull: false,
  )


  final DateTime createdAt;



      /// When the product last changed, UTC ISO 8601.
  @JsonKey(
    
    name: r'updatedAt',
    required: true,
    includeIfNull: false,
  )


  final DateTime updatedAt;



      /// The latest change request of this product: the pending one (its proposed content waiting for review), or the last decided one (approved, rejected with its reason, or superseded); null when there has never been one. Filled by the product reads (GET) and by a content edit (PUT); the other writes answer null here even when a request exists, so read the product again to show it.
  @JsonKey(
    
    name: r'changeRequest',
    required: true,
    includeIfNull: true,
  )


  final ProductChangeRequestResponseDto? changeRequest;





    @override
    bool operator ==(Object other) => identical(this, other) || other is ProductResponseDto &&
      other.id == id &&
      other.vendorId == vendorId &&
      other.status == status &&
      other.isAvailable == isAvailable &&
      other.fulfilment == fulfilment &&
      other.name == name &&
      other.description == description &&
      other.category == category &&
      other.meatType == meatType &&
      other.images == images &&
      other.sizes == sizes &&
      other.cuttings == cuttings &&
      other.packagings == packagings &&
      other.exclusions == exclusions &&
      other.minPriceHalalas == minPriceHalalas &&
      other.rejectionReason == rejectionReason &&
      other.submittedAt == submittedAt &&
      other.reviewedAt == reviewedAt &&
      other.publishedAt == publishedAt &&
      other.createdAt == createdAt &&
      other.updatedAt == updatedAt &&
      other.changeRequest == changeRequest;

    @override
    int get hashCode =>
        id.hashCode +
        vendorId.hashCode +
        status.hashCode +
        isAvailable.hashCode +
        fulfilment.hashCode +
        name.hashCode +
        description.hashCode +
        category.hashCode +
        (meatType == null ? 0 : meatType.hashCode) +
        images.hashCode +
        sizes.hashCode +
        cuttings.hashCode +
        packagings.hashCode +
        exclusions.hashCode +
        (minPriceHalalas == null ? 0 : minPriceHalalas.hashCode) +
        (rejectionReason == null ? 0 : rejectionReason.hashCode) +
        (submittedAt == null ? 0 : submittedAt.hashCode) +
        (reviewedAt == null ? 0 : reviewedAt.hashCode) +
        (publishedAt == null ? 0 : publishedAt.hashCode) +
        createdAt.hashCode +
        updatedAt.hashCode +
        (changeRequest == null ? 0 : changeRequest.hashCode);

  factory ProductResponseDto.fromJson(Map<String, dynamic> json) => _$ProductResponseDtoFromJson(json);

  Map<String, dynamic> toJson() => _$ProductResponseDtoToJson(this);

  @override
  String toString() {
    return toJson().toString();
  }

}

/// Where the product is: `draft` (being written; submit it), `pending_review` (waiting for admin review; nothing can be changed), `published` (live; a vendor’s content edits become change requests, availability, fulfilment and prices change at once), `rejected` (sent back with `rejectionReason`; edit and submit again). Moves: draft or rejected to pending_review (vendor submits), pending_review to published or rejected (admin decides), draft to published (admin, JAZLA products only); a published product stays published.
enum ProductResponseDtoStatusEnum {
    /// Where the product is: `draft` (being written; submit it), `pending_review` (waiting for admin review; nothing can be changed), `published` (live; a vendor’s content edits become change requests, availability, fulfilment and prices change at once), `rejected` (sent back with `rejectionReason`; edit and submit again). Moves: draft or rejected to pending_review (vendor submits), pending_review to published or rejected (admin decides), draft to published (admin, JAZLA products only); a published product stays published.
@JsonValue(r'draft')
draft(r'draft'),
    /// Where the product is: `draft` (being written; submit it), `pending_review` (waiting for admin review; nothing can be changed), `published` (live; a vendor’s content edits become change requests, availability, fulfilment and prices change at once), `rejected` (sent back with `rejectionReason`; edit and submit again). Moves: draft or rejected to pending_review (vendor submits), pending_review to published or rejected (admin decides), draft to published (admin, JAZLA products only); a published product stays published.
@JsonValue(r'pending_review')
pendingReview(r'pending_review'),
    /// Where the product is: `draft` (being written; submit it), `pending_review` (waiting for admin review; nothing can be changed), `published` (live; a vendor’s content edits become change requests, availability, fulfilment and prices change at once), `rejected` (sent back with `rejectionReason`; edit and submit again). Moves: draft or rejected to pending_review (vendor submits), pending_review to published or rejected (admin decides), draft to published (admin, JAZLA products only); a published product stays published.
@JsonValue(r'published')
published(r'published'),
    /// Where the product is: `draft` (being written; submit it), `pending_review` (waiting for admin review; nothing can be changed), `published` (live; a vendor’s content edits become change requests, availability, fulfilment and prices change at once), `rejected` (sent back with `rejectionReason`; edit and submit again). Moves: draft or rejected to pending_review (vendor submits), pending_review to published or rejected (admin decides), draft to published (admin, JAZLA products only); a published product stays published.
@JsonValue(r'rejected')
rejected(r'rejected'),
    /// Where the product is: `draft` (being written; submit it), `pending_review` (waiting for admin review; nothing can be changed), `published` (live; a vendor’s content edits become change requests, availability, fulfilment and prices change at once), `rejected` (sent back with `rejectionReason`; edit and submit again). Moves: draft or rejected to pending_review (vendor submits), pending_review to published or rejected (admin decides), draft to published (admin, JAZLA products only); a published product stays published.
@JsonValue(r'unknown_default_open_api')
unknownDefaultOpenApi(r'unknown_default_open_api');

const ProductResponseDtoStatusEnum(this.value);

final String value;

@override
String toString() => value;
}


/// How the product reaches the customer: `delivery`, `pickup` or `both`.
enum ProductResponseDtoFulfilmentEnum {
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

const ProductResponseDtoFulfilmentEnum(this.value);

final String value;

@override
String toString() => value;
}



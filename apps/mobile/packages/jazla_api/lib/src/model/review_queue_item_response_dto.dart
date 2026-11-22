//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:jazla_api/src/model/localized_text_response_dto.dart';
import 'package:jazla_api/src/model/product_vendor_response_dto.dart';
import 'package:json_annotation/json_annotation.dart';

part 'review_queue_item_response_dto.g.dart';


@JsonSerializable(
  checked: true,
  createToJson: true,
  disallowUnrecognizedKeys: false,
  explicitToJson: true,
)
class ReviewQueueItemResponseDto {
  /// Returns a new [ReviewQueueItemResponseDto] instance.
  ReviewQueueItemResponseDto({

    required  this.kind,

    required  this.productId,

    required  this.changeRequestId,

    required  this.vendor,

    required  this.name,

    required  this.submittedAt,
  });

      /// `product`: a new product waiting for review (approve or reject it with its product id); `change_request`: an edit of a published product (approve or reject it with `changeRequestId`).
  @JsonKey(
    
    name: r'kind',
    required: true,
    includeIfNull: false,
  unknownEnumValue: ReviewQueueItemResponseDtoKindEnum.unknownDefaultOpenApi,
  )


  final ReviewQueueItemResponseDtoKindEnum kind;



      /// The product id (UUID): open it with GET /v1/admin/products/{id}.
  @JsonKey(
    
    name: r'productId',
    required: true,
    includeIfNull: false,
  )


  final String productId;



      /// The change request’s id (UUID) for `change_request`, its content in GET /v1/admin/product-change-requests; null for `product`.
  @JsonKey(
    
    name: r'changeRequestId',
    required: true,
    includeIfNull: true,
  )


  final String? changeRequestId;



      /// The vendor who sent it, with the store name.
  @JsonKey(
    
    name: r'vendor',
    required: true,
    includeIfNull: false,
  )


  final ProductVendorResponseDto vendor;



      /// The product’s live name in Arabic and English (an edit may propose another).
  @JsonKey(
    
    name: r'name',
    required: true,
    includeIfNull: false,
  )


  final LocalizedTextResponseDto name;



      /// When it entered the queue, UTC ISO 8601: the product’s submission, or the vendor’s edit that opened the request.
  @JsonKey(
    
    name: r'submittedAt',
    required: true,
    includeIfNull: false,
  )


  final DateTime submittedAt;





    @override
    bool operator ==(Object other) => identical(this, other) || other is ReviewQueueItemResponseDto &&
      other.kind == kind &&
      other.productId == productId &&
      other.changeRequestId == changeRequestId &&
      other.vendor == vendor &&
      other.name == name &&
      other.submittedAt == submittedAt;

    @override
    int get hashCode =>
        kind.hashCode +
        productId.hashCode +
        (changeRequestId == null ? 0 : changeRequestId.hashCode) +
        vendor.hashCode +
        name.hashCode +
        submittedAt.hashCode;

  factory ReviewQueueItemResponseDto.fromJson(Map<String, dynamic> json) => _$ReviewQueueItemResponseDtoFromJson(json);

  Map<String, dynamic> toJson() => _$ReviewQueueItemResponseDtoToJson(this);

  @override
  String toString() {
    return toJson().toString();
  }

}

/// `product`: a new product waiting for review (approve or reject it with its product id); `change_request`: an edit of a published product (approve or reject it with `changeRequestId`).
enum ReviewQueueItemResponseDtoKindEnum {
    /// `product`: a new product waiting for review (approve or reject it with its product id); `change_request`: an edit of a published product (approve or reject it with `changeRequestId`).
@JsonValue(r'product')
product(r'product'),
    /// `product`: a new product waiting for review (approve or reject it with its product id); `change_request`: an edit of a published product (approve or reject it with `changeRequestId`).
@JsonValue(r'change_request')
changeRequest(r'change_request'),
    /// `product`: a new product waiting for review (approve or reject it with its product id); `change_request`: an edit of a published product (approve or reject it with `changeRequestId`).
@JsonValue(r'unknown_default_open_api')
unknownDefaultOpenApi(r'unknown_default_open_api');

const ReviewQueueItemResponseDtoKindEnum(this.value);

final String value;

@override
String toString() => value;
}



//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:jazla_api/src/model/product_content_response_dto.dart';
import 'package:json_annotation/json_annotation.dart';

part 'product_change_request_response_dto.g.dart';


@JsonSerializable(
  checked: true,
  createToJson: true,
  disallowUnrecognizedKeys: false,
  explicitToJson: true,
)
class ProductChangeRequestResponseDto {
  /// Returns a new [ProductChangeRequestResponseDto] instance.
  ProductChangeRequestResponseDto({

    required  this.id,

    required  this.productId,

    required  this.status,

    required  this.content,

    required  this.rejectionReason,

    required  this.createdAt,

    required  this.updatedAt,

    required  this.reviewedAt,
  });

      /// The change request id (UUID): approve or reject it with this id.
  @JsonKey(
    
    name: r'id',
    required: true,
    includeIfNull: false,
  )


  final String id;



      /// The id (UUID) of the published product the request would change.
  @JsonKey(
    
    name: r'productId',
    required: true,
    includeIfNull: false,
  )


  final String productId;



      /// `pending`: waiting for an admin; `approved`: its content became the live product; `rejected`: discarded, with `rejectionReason`; `superseded`: the vendor edited again before a decision, which opened a newer request. Only `pending` can be decided.
  @JsonKey(
    
    name: r'status',
    required: true,
    includeIfNull: false,
  unknownEnumValue: ProductChangeRequestResponseDtoStatusEnum.unknownDefaultOpenApi,
  )


  final ProductChangeRequestResponseDtoStatusEnum status;



      /// The content as the vendor proposed it. Prices of sizes and cuttings the product already has are as they were then: approval keeps their live prices (see the product), and only new sizes and cuttings take the prices shown.
  @JsonKey(
    
    name: r'content',
    required: true,
    includeIfNull: false,
  )


  final ProductContentResponseDto content;



      /// The admin’s reason, shown to the vendor; set only when `status` is `rejected`, otherwise null.
  @JsonKey(
    
    name: r'rejectionReason',
    required: true,
    includeIfNull: true,
  )


  final String? rejectionReason;



      /// When the vendor sent the edit, UTC ISO 8601.
  @JsonKey(
    
    name: r'createdAt',
    required: true,
    includeIfNull: false,
  )


  final DateTime createdAt;



      /// When the request last changed status, UTC ISO 8601.
  @JsonKey(
    
    name: r'updatedAt',
    required: true,
    includeIfNull: false,
  )


  final DateTime updatedAt;



      /// When an admin approved or rejected it, UTC ISO 8601; null while pending and for a superseded request.
  @JsonKey(
    
    name: r'reviewedAt',
    required: true,
    includeIfNull: true,
  )


  final DateTime? reviewedAt;





    @override
    bool operator ==(Object other) => identical(this, other) || other is ProductChangeRequestResponseDto &&
      other.id == id &&
      other.productId == productId &&
      other.status == status &&
      other.content == content &&
      other.rejectionReason == rejectionReason &&
      other.createdAt == createdAt &&
      other.updatedAt == updatedAt &&
      other.reviewedAt == reviewedAt;

    @override
    int get hashCode =>
        id.hashCode +
        productId.hashCode +
        status.hashCode +
        content.hashCode +
        (rejectionReason == null ? 0 : rejectionReason.hashCode) +
        createdAt.hashCode +
        updatedAt.hashCode +
        (reviewedAt == null ? 0 : reviewedAt.hashCode);

  factory ProductChangeRequestResponseDto.fromJson(Map<String, dynamic> json) => _$ProductChangeRequestResponseDtoFromJson(json);

  Map<String, dynamic> toJson() => _$ProductChangeRequestResponseDtoToJson(this);

  @override
  String toString() {
    return toJson().toString();
  }

}

/// `pending`: waiting for an admin; `approved`: its content became the live product; `rejected`: discarded, with `rejectionReason`; `superseded`: the vendor edited again before a decision, which opened a newer request. Only `pending` can be decided.
enum ProductChangeRequestResponseDtoStatusEnum {
    /// `pending`: waiting for an admin; `approved`: its content became the live product; `rejected`: discarded, with `rejectionReason`; `superseded`: the vendor edited again before a decision, which opened a newer request. Only `pending` can be decided.
@JsonValue(r'pending')
pending(r'pending'),
    /// `pending`: waiting for an admin; `approved`: its content became the live product; `rejected`: discarded, with `rejectionReason`; `superseded`: the vendor edited again before a decision, which opened a newer request. Only `pending` can be decided.
@JsonValue(r'approved')
approved(r'approved'),
    /// `pending`: waiting for an admin; `approved`: its content became the live product; `rejected`: discarded, with `rejectionReason`; `superseded`: the vendor edited again before a decision, which opened a newer request. Only `pending` can be decided.
@JsonValue(r'rejected')
rejected(r'rejected'),
    /// `pending`: waiting for an admin; `approved`: its content became the live product; `rejected`: discarded, with `rejectionReason`; `superseded`: the vendor edited again before a decision, which opened a newer request. Only `pending` can be decided.
@JsonValue(r'superseded')
superseded(r'superseded'),
    /// `pending`: waiting for an admin; `approved`: its content became the live product; `rejected`: discarded, with `rejectionReason`; `superseded`: the vendor edited again before a decision, which opened a newer request. Only `pending` can be decided.
@JsonValue(r'unknown_default_open_api')
unknownDefaultOpenApi(r'unknown_default_open_api');

const ProductChangeRequestResponseDtoStatusEnum(this.value);

final String value;

@override
String toString() => value;
}



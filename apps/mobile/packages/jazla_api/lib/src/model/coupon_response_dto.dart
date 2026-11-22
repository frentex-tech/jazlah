//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:json_annotation/json_annotation.dart';

part 'coupon_response_dto.g.dart';


@JsonSerializable(
  checked: true,
  createToJson: true,
  disallowUnrecognizedKeys: false,
  explicitToJson: true,
)
class CouponResponseDto {
  /// Returns a new [CouponResponseDto] instance.
  CouponResponseDto({

    required  this.id,

    required  this.code,

    required  this.type,

    required  this.value,

    required  this.maxDiscountHalalas,

    required  this.minOrderHalalas,

    required  this.vendorIds,

    required  this.categoryIds,

    required  this.startsAt,

    required  this.endsAt,

    required  this.usageLimit,

    required  this.perUserLimit,

    required  this.isActive,

    required  this.status,

    required  this.usageCount,

    required  this.createdAt,

    required  this.updatedAt,
  });

      /// The coupon (UUID).
  @JsonKey(
    
    name: r'id',
    required: true,
    includeIfNull: false,
  )


  final String id;



      /// The code customers type, 3 to 32 letters, digits, `_` or `-`; stored upper case, unique in any case (COUPON_CODE_TAKEN).
  @JsonKey(
    
    name: r'code',
    required: true,
    includeIfNull: false,
  )


  final String code;



      /// `percent` or `fixed`.
  @JsonKey(
    
    name: r'type',
    required: true,
    includeIfNull: false,
  unknownEnumValue: CouponResponseDtoTypeEnum.unknownDefaultOpenApi,
  )


  final CouponResponseDtoTypeEnum type;



      /// percent: 1 to 100 (VALIDATION_FAILED `percent` above); fixed: halalas, 1 to 10000000.
          // minimum: 1
          // maximum: 10000000
  @JsonKey(
    
    name: r'value',
    required: true,
    includeIfNull: false,
  )


  final int value;



      /// The most a percent coupon takes off, in halalas; null: no cap (send null for fixed).
          // minimum: 1
          // maximum: 10000000
  @JsonKey(
    
    name: r'maxDiscountHalalas',
    required: true,
    includeIfNull: true,
  )


  final int? maxDiscountHalalas;



      /// The smallest subtotal of the whole cart before discounts it applies to; null: none.
          // minimum: 0
          // maximum: 10000000
  @JsonKey(
    
    name: r'minOrderHalalas',
    required: true,
    includeIfNull: true,
  )


  final int? minOrderHalalas;



      /// The stores it is for, at most 200; empty: every store.
  @JsonKey(
    
    name: r'vendorIds',
    required: true,
    includeIfNull: false,
  )


  final List<String> vendorIds;



      /// The categories whose lines it discounts, at most 200; empty: every line.
  @JsonKey(
    
    name: r'categoryIds',
    required: true,
    includeIfNull: false,
  )


  final List<String> categoryIds;



      /// When it starts (UTC).
  @JsonKey(
    
    name: r'startsAt',
    required: true,
    includeIfNull: false,
  )


  final DateTime startsAt;



      /// When it ends (UTC).
  @JsonKey(
    
    name: r'endsAt',
    required: true,
    includeIfNull: false,
  )


  final DateTime endsAt;



      /// How many orders in all may use it; null: no limit.
          // minimum: 1
          // maximum: 10000000
  @JsonKey(
    
    name: r'usageLimit',
    required: true,
    includeIfNull: true,
  )


  final int? usageLimit;



      /// How many orders of one customer may use it; null: no limit.
          // minimum: 1
          // maximum: 1000
  @JsonKey(
    
    name: r'perUserLimit',
    required: true,
    includeIfNull: true,
  )


  final int? perUserLimit;



      /// Switched on; false: no one can use it.
  @JsonKey(
    
    name: r'isActive',
    required: true,
    includeIfNull: false,
  )


  final bool isActive;



      /// Its state now.
  @JsonKey(
    
    name: r'status',
    required: true,
    includeIfNull: false,
  unknownEnumValue: CouponResponseDtoStatusEnum.unknownDefaultOpenApi,
  )


  final CouponResponseDtoStatusEnum status;



      /// Orders that used it (not cancelled).
  @JsonKey(
    
    name: r'usageCount',
    required: true,
    includeIfNull: false,
  )


  final int usageCount;



      /// Created (UTC).
  @JsonKey(
    
    name: r'createdAt',
    required: true,
    includeIfNull: false,
  )


  final DateTime createdAt;



      /// Last changed (UTC).
  @JsonKey(
    
    name: r'updatedAt',
    required: true,
    includeIfNull: false,
  )


  final DateTime updatedAt;





    @override
    bool operator ==(Object other) => identical(this, other) || other is CouponResponseDto &&
      other.id == id &&
      other.code == code &&
      other.type == type &&
      other.value == value &&
      other.maxDiscountHalalas == maxDiscountHalalas &&
      other.minOrderHalalas == minOrderHalalas &&
      other.vendorIds == vendorIds &&
      other.categoryIds == categoryIds &&
      other.startsAt == startsAt &&
      other.endsAt == endsAt &&
      other.usageLimit == usageLimit &&
      other.perUserLimit == perUserLimit &&
      other.isActive == isActive &&
      other.status == status &&
      other.usageCount == usageCount &&
      other.createdAt == createdAt &&
      other.updatedAt == updatedAt;

    @override
    int get hashCode =>
        id.hashCode +
        code.hashCode +
        type.hashCode +
        value.hashCode +
        (maxDiscountHalalas == null ? 0 : maxDiscountHalalas.hashCode) +
        (minOrderHalalas == null ? 0 : minOrderHalalas.hashCode) +
        vendorIds.hashCode +
        categoryIds.hashCode +
        startsAt.hashCode +
        endsAt.hashCode +
        (usageLimit == null ? 0 : usageLimit.hashCode) +
        (perUserLimit == null ? 0 : perUserLimit.hashCode) +
        isActive.hashCode +
        status.hashCode +
        usageCount.hashCode +
        createdAt.hashCode +
        updatedAt.hashCode;

  factory CouponResponseDto.fromJson(Map<String, dynamic> json) => _$CouponResponseDtoFromJson(json);

  Map<String, dynamic> toJson() => _$CouponResponseDtoToJson(this);

  @override
  String toString() {
    return toJson().toString();
  }

}

/// `percent` or `fixed`.
enum CouponResponseDtoTypeEnum {
    /// `percent` or `fixed`.
@JsonValue(r'percent')
percent(r'percent'),
    /// `percent` or `fixed`.
@JsonValue(r'fixed')
fixed(r'fixed'),
    /// `percent` or `fixed`.
@JsonValue(r'unknown_default_open_api')
unknownDefaultOpenApi(r'unknown_default_open_api');

const CouponResponseDtoTypeEnum(this.value);

final String value;

@override
String toString() => value;
}


/// Its state now.
enum CouponResponseDtoStatusEnum {
    /// Its state now.
@JsonValue(r'active')
active(r'active'),
    /// Its state now.
@JsonValue(r'scheduled')
scheduled(r'scheduled'),
    /// Its state now.
@JsonValue(r'expired')
expired(r'expired'),
    /// Its state now.
@JsonValue(r'inactive')
inactive(r'inactive'),
    /// Its state now.
@JsonValue(r'unknown_default_open_api')
unknownDefaultOpenApi(r'unknown_default_open_api');

const CouponResponseDtoStatusEnum(this.value);

final String value;

@override
String toString() => value;
}



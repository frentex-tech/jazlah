//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:json_annotation/json_annotation.dart';

part 'update_coupon_dto.g.dart';


@JsonSerializable(
  checked: true,
  createToJson: true,
  disallowUnrecognizedKeys: false,
  explicitToJson: true,
)
class UpdateCouponDto {
  /// Returns a new [UpdateCouponDto] instance.
  UpdateCouponDto({

     this.code,

     this.type,

     this.value,

     this.maxDiscountHalalas,

     this.minOrderHalalas,

     this.vendorIds,

     this.categoryIds,

     this.startsAt,

     this.endsAt,

     this.usageLimit,

     this.perUserLimit,

     this.isActive,
  });

      /// The code customers type, 3 to 32 letters, digits, `_` or `-`; stored upper case, unique in any case (COUPON_CODE_TAKEN). Left out: unchanged; null: VALIDATION_FAILED.
  @JsonKey(
    
    name: r'code',
    required: false,
    includeIfNull: false,
  )


  final String? code;



      /// `percent` or `fixed`. Left out: unchanged; null: VALIDATION_FAILED.
  @JsonKey(
    
    name: r'type',
    required: false,
    includeIfNull: false,
  unknownEnumValue: UpdateCouponDtoTypeEnum.unknownDefaultOpenApi,
  )


  final UpdateCouponDtoTypeEnum? type;



      /// percent: 1 to 100 (VALIDATION_FAILED `percent` above); fixed: halalas, 1 to 10000000. Left out: unchanged; null: VALIDATION_FAILED.
          // minimum: 1
          // maximum: 10000000
  @JsonKey(
    
    name: r'value',
    required: false,
    includeIfNull: false,
  )


  final int? value;



      /// The most a percent coupon takes off, in halalas; null: no cap (send null for fixed). Left out: unchanged.
          // minimum: 1
          // maximum: 10000000
  @JsonKey(
    
    name: r'maxDiscountHalalas',
    required: false,
    includeIfNull: false,
  )


  final int? maxDiscountHalalas;



      /// The smallest subtotal of the whole cart before discounts it applies to; null: none. Left out: unchanged.
          // minimum: 0
          // maximum: 10000000
  @JsonKey(
    
    name: r'minOrderHalalas',
    required: false,
    includeIfNull: false,
  )


  final int? minOrderHalalas;



      /// The stores it is for, at most 200; empty: every store. Left out: unchanged; null: VALIDATION_FAILED.
  @JsonKey(
    
    name: r'vendorIds',
    required: false,
    includeIfNull: false,
  )


  final List<String>? vendorIds;



      /// The categories whose lines it discounts, at most 200; empty: every line. Left out: unchanged; null: VALIDATION_FAILED.
  @JsonKey(
    
    name: r'categoryIds',
    required: false,
    includeIfNull: false,
  )


  final List<String>? categoryIds;



      /// When it starts: an ISO 8601 date and time with `Z` or an offset (VALIDATION_FAILED `isInstant` otherwise). Left out: unchanged; null: VALIDATION_FAILED.
  @JsonKey(
    
    name: r'startsAt',
    required: false,
    includeIfNull: false,
  )


  final String? startsAt;



      /// When it ends, after startsAt (VALIDATION_FAILED `endBeforeStart` otherwise); with `Z` or an offset. Left out: unchanged; null: VALIDATION_FAILED.
  @JsonKey(
    
    name: r'endsAt',
    required: false,
    includeIfNull: false,
  )


  final String? endsAt;



      /// How many orders in all may use it; null: no limit. Left out: unchanged.
          // minimum: 1
          // maximum: 10000000
  @JsonKey(
    
    name: r'usageLimit',
    required: false,
    includeIfNull: false,
  )


  final int? usageLimit;



      /// How many orders of one customer may use it; null: no limit. Left out: unchanged.
          // minimum: 1
          // maximum: 1000
  @JsonKey(
    
    name: r'perUserLimit',
    required: false,
    includeIfNull: false,
  )


  final int? perUserLimit;



      /// Switched on; false: no one can use it. Left out: unchanged; null: VALIDATION_FAILED.
  @JsonKey(
    
    name: r'isActive',
    required: false,
    includeIfNull: false,
  )


  final bool? isActive;





    @override
    bool operator ==(Object other) => identical(this, other) || other is UpdateCouponDto &&
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
      other.isActive == isActive;

    @override
    int get hashCode =>
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
        isActive.hashCode;

  factory UpdateCouponDto.fromJson(Map<String, dynamic> json) => _$UpdateCouponDtoFromJson(json);

  Map<String, dynamic> toJson() => _$UpdateCouponDtoToJson(this);

  @override
  String toString() {
    return toJson().toString();
  }

}

/// `percent` or `fixed`. Left out: unchanged; null: VALIDATION_FAILED.
enum UpdateCouponDtoTypeEnum {
    /// `percent` or `fixed`. Left out: unchanged; null: VALIDATION_FAILED.
@JsonValue(r'percent')
percent(r'percent'),
    /// `percent` or `fixed`. Left out: unchanged; null: VALIDATION_FAILED.
@JsonValue(r'fixed')
fixed(r'fixed'),
    /// `percent` or `fixed`. Left out: unchanged; null: VALIDATION_FAILED.
@JsonValue(r'unknown_default_open_api')
unknownDefaultOpenApi(r'unknown_default_open_api');

const UpdateCouponDtoTypeEnum(this.value);

final String value;

@override
String toString() => value;
}



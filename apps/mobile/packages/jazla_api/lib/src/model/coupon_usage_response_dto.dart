//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:json_annotation/json_annotation.dart';

part 'coupon_usage_response_dto.g.dart';


@JsonSerializable(
  checked: true,
  createToJson: true,
  disallowUnrecognizedKeys: false,
  explicitToJson: true,
)
class CouponUsageResponseDto {
  /// Returns a new [CouponUsageResponseDto] instance.
  CouponUsageResponseDto({

    required  this.uses,

    required  this.distinctCustomers,

    required  this.totalDiscountHalalas,
  });

      /// Orders that used it (not cancelled, and not unpaid past their `expiresAt`).
  @JsonKey(
    
    name: r'uses',
    required: true,
    includeIfNull: false,
  )


  final int uses;



      /// Different customers among them.
  @JsonKey(
    
    name: r'distinctCustomers',
    required: true,
    includeIfNull: false,
  )


  final int distinctCustomers;



      /// What it took off in all, in halalas.
  @JsonKey(
    
    name: r'totalDiscountHalalas',
    required: true,
    includeIfNull: false,
  )


  final int totalDiscountHalalas;





    @override
    bool operator ==(Object other) => identical(this, other) || other is CouponUsageResponseDto &&
      other.uses == uses &&
      other.distinctCustomers == distinctCustomers &&
      other.totalDiscountHalalas == totalDiscountHalalas;

    @override
    int get hashCode =>
        uses.hashCode +
        distinctCustomers.hashCode +
        totalDiscountHalalas.hashCode;

  factory CouponUsageResponseDto.fromJson(Map<String, dynamic> json) => _$CouponUsageResponseDtoFromJson(json);

  Map<String, dynamic> toJson() => _$CouponUsageResponseDtoToJson(this);

  @override
  String toString() {
    return toJson().toString();
  }

}


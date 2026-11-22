//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:json_annotation/json_annotation.dart';

part 'cart_coupon_response_dto.g.dart';


@JsonSerializable(
  checked: true,
  createToJson: true,
  disallowUnrecognizedKeys: false,
  explicitToJson: true,
)
class CartCouponResponseDto {
  /// Returns a new [CartCouponResponseDto] instance.
  CartCouponResponseDto({

    required  this.code,

    required  this.discountHalalas,
  });

      /// The code, upper case.
  @JsonKey(
    
    name: r'code',
    required: true,
    includeIfNull: false,
  )


  final String code;



      /// What it takes off now, in halalas.
  @JsonKey(
    
    name: r'discountHalalas',
    required: true,
    includeIfNull: false,
  )


  final int discountHalalas;





    @override
    bool operator ==(Object other) => identical(this, other) || other is CartCouponResponseDto &&
      other.code == code &&
      other.discountHalalas == discountHalalas;

    @override
    int get hashCode =>
        code.hashCode +
        discountHalalas.hashCode;

  factory CartCouponResponseDto.fromJson(Map<String, dynamic> json) => _$CartCouponResponseDtoFromJson(json);

  Map<String, dynamic> toJson() => _$CartCouponResponseDtoToJson(this);

  @override
  String toString() {
    return toJson().toString();
  }

}


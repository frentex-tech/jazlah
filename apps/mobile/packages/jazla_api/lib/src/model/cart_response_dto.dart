//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:jazla_api/src/model/cart_coupon_response_dto.dart';
import 'package:jazla_api/src/model/cart_issue_response_dto.dart';
import 'package:jazla_api/src/model/cart_vendor_response_dto.dart';
import 'package:jazla_api/src/model/cart_fulfilment_response_dto.dart';
import 'package:jazla_api/src/model/cart_line_response_dto.dart';
import 'package:json_annotation/json_annotation.dart';

part 'cart_response_dto.g.dart';


@JsonSerializable(
  checked: true,
  createToJson: true,
  disallowUnrecognizedKeys: false,
  explicitToJson: true,
)
class CartResponseDto {
  /// Returns a new [CartResponseDto] instance.
  CartResponseDto({

    required  this.vendor,

    required  this.lines,

    required  this.coupon,

    required  this.fulfilment,

    required  this.subtotalHalalas,

    required  this.discountHalalas,

    required  this.deliveryFeeHalalas,

    required  this.totalHalalas,

    required  this.vatHalalas,

    required  this.minOrderHalalas,

    required  this.minOrderRemainingHalalas,

    required  this.issues,

    required  this.canCheckout,
  });

      /// The store; null while the cart is empty.
  @JsonKey(
    
    name: r'vendor',
    required: true,
    includeIfNull: true,
  )


  final CartVendorResponseDto? vendor;



      /// The lines, in the order added; empty for an empty cart.
  @JsonKey(
    
    name: r'lines',
    required: true,
    includeIfNull: false,
  )


  final List<CartLineResponseDto> lines;



      /// The coupon applied; null for none. A coupon that stopped applying is removed and absent.
  @JsonKey(
    
    name: r'coupon',
    required: true,
    includeIfNull: true,
  )


  final CartCouponResponseDto? coupon;



      /// The fulfilment chosen; null until set (PATCH /v1/customer/cart/fulfilment).
  @JsonKey(
    
    name: r'fulfilment',
    required: true,
    includeIfNull: true,
  )


  final CartFulfilmentResponseDto? fulfilment;



      /// The lines’ total, in halalas, VAT included.
  @JsonKey(
    
    name: r'subtotalHalalas',
    required: true,
    includeIfNull: false,
  )


  final int subtotalHalalas;



      /// The coupon discount; 0 for none.
  @JsonKey(
    
    name: r'discountHalalas',
    required: true,
    includeIfNull: false,
  )


  final int discountHalalas;



      /// The delivery fee; 0 unless delivery is chosen.
  @JsonKey(
    
    name: r'deliveryFeeHalalas',
    required: true,
    includeIfNull: false,
  )


  final int deliveryFeeHalalas;



      /// subtotal − discount + delivery fee.
  @JsonKey(
    
    name: r'totalHalalas',
    required: true,
    includeIfNull: false,
  )


  final int totalHalalas;



      /// The VAT inside the total: round half up of total × 15 / 115.
  @JsonKey(
    
    name: r'vatHalalas',
    required: true,
    includeIfNull: false,
  )


  final int vatHalalas;



      /// The smallest order, compared with the subtotal before the discount.
  @JsonKey(
    
    name: r'minOrderHalalas',
    required: true,
    includeIfNull: false,
  )


  final int minOrderHalalas;



      /// How much more is needed to reach the minimum; 0 once reached.
  @JsonKey(
    
    name: r'minOrderRemainingHalalas',
    required: true,
    includeIfNull: false,
  )


  final int minOrderRemainingHalalas;



      /// What blocks checkout on its lines; empty for none.
  @JsonKey(
    
    name: r'issues',
    required: true,
    includeIfNull: false,
  )


  final List<CartIssueResponseDto> issues;



      /// True when there are lines, no issues and the minimum is reached.
  @JsonKey(
    
    name: r'canCheckout',
    required: true,
    includeIfNull: false,
  )


  final bool canCheckout;





    @override
    bool operator ==(Object other) => identical(this, other) || other is CartResponseDto &&
      other.vendor == vendor &&
      other.lines == lines &&
      other.coupon == coupon &&
      other.fulfilment == fulfilment &&
      other.subtotalHalalas == subtotalHalalas &&
      other.discountHalalas == discountHalalas &&
      other.deliveryFeeHalalas == deliveryFeeHalalas &&
      other.totalHalalas == totalHalalas &&
      other.vatHalalas == vatHalalas &&
      other.minOrderHalalas == minOrderHalalas &&
      other.minOrderRemainingHalalas == minOrderRemainingHalalas &&
      other.issues == issues &&
      other.canCheckout == canCheckout;

    @override
    int get hashCode =>
        (vendor == null ? 0 : vendor.hashCode) +
        lines.hashCode +
        (coupon == null ? 0 : coupon.hashCode) +
        (fulfilment == null ? 0 : fulfilment.hashCode) +
        subtotalHalalas.hashCode +
        discountHalalas.hashCode +
        deliveryFeeHalalas.hashCode +
        totalHalalas.hashCode +
        vatHalalas.hashCode +
        minOrderHalalas.hashCode +
        minOrderRemainingHalalas.hashCode +
        issues.hashCode +
        canCheckout.hashCode;

  factory CartResponseDto.fromJson(Map<String, dynamic> json) => _$CartResponseDtoFromJson(json);

  Map<String, dynamic> toJson() => _$CartResponseDtoToJson(this);

  @override
  String toString() {
    return toJson().toString();
  }

}


//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:jazla_api/src/model/coupon_response_dto.dart';
import 'package:json_annotation/json_annotation.dart';

part 'coupon_page_response_dto.g.dart';


@JsonSerializable(
  checked: true,
  createToJson: true,
  disallowUnrecognizedKeys: false,
  explicitToJson: true,
)
class CouponPageResponseDto {
  /// Returns a new [CouponPageResponseDto] instance.
  CouponPageResponseDto({

    required  this.items,

    required  this.nextCursor,
  });

      /// The coupons on this page.
  @JsonKey(
    
    name: r'items',
    required: true,
    includeIfNull: false,
  )


  final List<CouponResponseDto> items;



      /// Send as `cursor` for the next page; null on the last.
  @JsonKey(
    
    name: r'nextCursor',
    required: true,
    includeIfNull: true,
  )


  final String? nextCursor;





    @override
    bool operator ==(Object other) => identical(this, other) || other is CouponPageResponseDto &&
      other.items == items &&
      other.nextCursor == nextCursor;

    @override
    int get hashCode =>
        items.hashCode +
        (nextCursor == null ? 0 : nextCursor.hashCode);

  factory CouponPageResponseDto.fromJson(Map<String, dynamic> json) => _$CouponPageResponseDtoFromJson(json);

  Map<String, dynamic> toJson() => _$CouponPageResponseDtoToJson(this);

  @override
  String toString() {
    return toJson().toString();
  }

}


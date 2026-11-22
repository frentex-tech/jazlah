//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:json_annotation/json_annotation.dart';

part 'apply_coupon_dto.g.dart';


@JsonSerializable(
  checked: true,
  createToJson: true,
  disallowUnrecognizedKeys: false,
  explicitToJson: true,
)
class ApplyCouponDto {
  /// Returns a new [ApplyCouponDto] instance.
  ApplyCouponDto({

    required  this.code,
  });

      /// The code, any case, 3 to 32 characters.
  @JsonKey(
    
    name: r'code',
    required: true,
    includeIfNull: false,
  )


  final String code;





    @override
    bool operator ==(Object other) => identical(this, other) || other is ApplyCouponDto &&
      other.code == code;

    @override
    int get hashCode =>
        code.hashCode;

  factory ApplyCouponDto.fromJson(Map<String, dynamic> json) => _$ApplyCouponDtoFromJson(json);

  Map<String, dynamic> toJson() => _$ApplyCouponDtoToJson(this);

  @override
  String toString() {
    return toJson().toString();
  }

}


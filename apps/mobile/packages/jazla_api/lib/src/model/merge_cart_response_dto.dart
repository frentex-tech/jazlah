//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:jazla_api/src/model/cart_response_dto.dart';
import 'package:json_annotation/json_annotation.dart';

part 'merge_cart_response_dto.g.dart';


@JsonSerializable(
  checked: true,
  createToJson: true,
  disallowUnrecognizedKeys: false,
  explicitToJson: true,
)
class MergeCartResponseDto {
  /// Returns a new [MergeCartResponseDto] instance.
  MergeCartResponseDto({

    required  this.cart,

    required  this.replacedPreviousCart,

    required  this.skippedCount,
  });

      /// The account’s cart now.
  @JsonKey(
    
    name: r'cart',
    required: true,
    includeIfNull: false,
  )


  final CartResponseDto cart;



      /// True when the account’s cart held another store’s products and was replaced by the guest cart.
  @JsonKey(
    
    name: r'replacedPreviousCart',
    required: true,
    includeIfNull: false,
  )


  final bool replacedPreviousCart;



      /// Guest lines left out because they can no longer be ordered as chosen.
  @JsonKey(
    
    name: r'skippedCount',
    required: true,
    includeIfNull: false,
  )


  final int skippedCount;





    @override
    bool operator ==(Object other) => identical(this, other) || other is MergeCartResponseDto &&
      other.cart == cart &&
      other.replacedPreviousCart == replacedPreviousCart &&
      other.skippedCount == skippedCount;

    @override
    int get hashCode =>
        cart.hashCode +
        replacedPreviousCart.hashCode +
        skippedCount.hashCode;

  factory MergeCartResponseDto.fromJson(Map<String, dynamic> json) => _$MergeCartResponseDtoFromJson(json);

  Map<String, dynamic> toJson() => _$MergeCartResponseDtoToJson(this);

  @override
  String toString() {
    return toJson().toString();
  }

}


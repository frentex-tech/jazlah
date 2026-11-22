//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:json_annotation/json_annotation.dart';

part 'update_cart_item_dto.g.dart';


@JsonSerializable(
  checked: true,
  createToJson: true,
  disallowUnrecognizedKeys: false,
  explicitToJson: true,
)
class UpdateCartItemDto {
  /// Returns a new [UpdateCartItemDto] instance.
  UpdateCartItemDto({

    required  this.quantity,
  });

      /// The new quantity, 1 to 99. Sending the same quantity accepts a changed price (clears PRICE_CHANGED).
          // minimum: 1
          // maximum: 99
  @JsonKey(
    
    name: r'quantity',
    required: true,
    includeIfNull: false,
  )


  final int quantity;





    @override
    bool operator ==(Object other) => identical(this, other) || other is UpdateCartItemDto &&
      other.quantity == quantity;

    @override
    int get hashCode =>
        quantity.hashCode;

  factory UpdateCartItemDto.fromJson(Map<String, dynamic> json) => _$UpdateCartItemDtoFromJson(json);

  Map<String, dynamic> toJson() => _$UpdateCartItemDtoToJson(this);

  @override
  String toString() {
    return toJson().toString();
  }

}


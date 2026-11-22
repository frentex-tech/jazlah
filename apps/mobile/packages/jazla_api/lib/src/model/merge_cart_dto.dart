//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:jazla_api/src/model/cart_item_input_dto.dart';
import 'package:json_annotation/json_annotation.dart';

part 'merge_cart_dto.g.dart';


@JsonSerializable(
  checked: true,
  createToJson: true,
  disallowUnrecognizedKeys: false,
  explicitToJson: true,
)
class MergeCartDto {
  /// Returns a new [MergeCartDto] instance.
  MergeCartDto({

    required  this.mergeId,

    required  this.items,
  });

      /// A UUID made once per guest cart: repeating the merge with it answers the first result and adds nothing.
  @JsonKey(
    
    name: r'mergeId',
    required: true,
    includeIfNull: false,
  )


  final String mergeId;



      /// The guest cart’s lines, at most 50.
  @JsonKey(
    
    name: r'items',
    required: true,
    includeIfNull: false,
  )


  final List<CartItemInputDto> items;





    @override
    bool operator ==(Object other) => identical(this, other) || other is MergeCartDto &&
      other.mergeId == mergeId &&
      other.items == items;

    @override
    int get hashCode =>
        mergeId.hashCode +
        items.hashCode;

  factory MergeCartDto.fromJson(Map<String, dynamic> json) => _$MergeCartDtoFromJson(json);

  Map<String, dynamic> toJson() => _$MergeCartDtoToJson(this);

  @override
  String toString() {
    return toJson().toString();
  }

}


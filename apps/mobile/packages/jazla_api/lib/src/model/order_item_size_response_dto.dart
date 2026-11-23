//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:jazla_api/src/model/localized_text_response_dto.dart';
import 'package:json_annotation/json_annotation.dart';

part 'order_item_size_response_dto.g.dart';


@JsonSerializable(
  checked: true,
  createToJson: true,
  disallowUnrecognizedKeys: false,
  explicitToJson: true,
)
class OrderItemSizeResponseDto {
  /// Returns a new [OrderItemSizeResponseDto] instance.
  OrderItemSizeResponseDto({

    required  this.id,

    required  this.approxWeightGrams,

    required  this.tag,
  });

      /// The size’s id (UUID).
  @JsonKey(
    
    name: r'id',
    required: true,
    includeIfNull: false,
  )


  final String id;



      /// Approximate weight in grams; the final weight may differ.
  @JsonKey(
    
    name: r'approxWeightGrams',
    required: true,
    includeIfNull: false,
  )


  final int approxWeightGrams;



      /// The size’s label, null for none.
  @JsonKey(
    
    name: r'tag',
    required: true,
    includeIfNull: true,
  )


  final LocalizedTextResponseDto? tag;





    @override
    bool operator ==(Object other) => identical(this, other) || other is OrderItemSizeResponseDto &&
      other.id == id &&
      other.approxWeightGrams == approxWeightGrams &&
      other.tag == tag;

    @override
    int get hashCode =>
        id.hashCode +
        approxWeightGrams.hashCode +
        (tag == null ? 0 : tag.hashCode);

  factory OrderItemSizeResponseDto.fromJson(Map<String, dynamic> json) => _$OrderItemSizeResponseDtoFromJson(json);

  Map<String, dynamic> toJson() => _$OrderItemSizeResponseDtoToJson(this);

  @override
  String toString() {
    return toJson().toString();
  }

}


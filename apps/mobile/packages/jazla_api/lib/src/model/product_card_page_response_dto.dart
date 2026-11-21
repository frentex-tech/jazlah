//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:jazla_api/src/model/product_card_response_dto.dart';
import 'package:json_annotation/json_annotation.dart';

part 'product_card_page_response_dto.g.dart';


@JsonSerializable(
  checked: true,
  createToJson: true,
  disallowUnrecognizedKeys: false,
  explicitToJson: true,
)
class ProductCardPageResponseDto {
  /// Returns a new [ProductCardPageResponseDto] instance.
  ProductCardPageResponseDto({

    required  this.items,

    required  this.nextCursor,
  });

      /// The products of this page, newest first; empty when none match.
  @JsonKey(
    
    name: r'items',
    required: true,
    includeIfNull: false,
  )


  final List<ProductCardResponseDto> items;



      /// Send as `cursor` for the next page; null on the last page.
  @JsonKey(
    
    name: r'nextCursor',
    required: true,
    includeIfNull: true,
  )


  final String? nextCursor;





    @override
    bool operator ==(Object other) => identical(this, other) || other is ProductCardPageResponseDto &&
      other.items == items &&
      other.nextCursor == nextCursor;

    @override
    int get hashCode =>
        items.hashCode +
        (nextCursor == null ? 0 : nextCursor.hashCode);

  factory ProductCardPageResponseDto.fromJson(Map<String, dynamic> json) => _$ProductCardPageResponseDtoFromJson(json);

  Map<String, dynamic> toJson() => _$ProductCardPageResponseDtoToJson(this);

  @override
  String toString() {
    return toJson().toString();
  }

}


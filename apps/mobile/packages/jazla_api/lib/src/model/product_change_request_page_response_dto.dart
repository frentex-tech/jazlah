//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:jazla_api/src/model/product_change_request_response_dto.dart';
import 'package:json_annotation/json_annotation.dart';

part 'product_change_request_page_response_dto.g.dart';


@JsonSerializable(
  checked: true,
  createToJson: true,
  disallowUnrecognizedKeys: false,
  explicitToJson: true,
)
class ProductChangeRequestPageResponseDto {
  /// Returns a new [ProductChangeRequestPageResponseDto] instance.
  ProductChangeRequestPageResponseDto({

    required  this.items,

    required  this.nextCursor,
  });

      /// The pending change requests of this page, newest first; empty when none wait.
  @JsonKey(
    
    name: r'items',
    required: true,
    includeIfNull: false,
  )


  final List<ProductChangeRequestResponseDto> items;



      /// Send as `cursor` for the next page; null on the last page.
  @JsonKey(
    
    name: r'nextCursor',
    required: true,
    includeIfNull: true,
  )


  final String? nextCursor;





    @override
    bool operator ==(Object other) => identical(this, other) || other is ProductChangeRequestPageResponseDto &&
      other.items == items &&
      other.nextCursor == nextCursor;

    @override
    int get hashCode =>
        items.hashCode +
        (nextCursor == null ? 0 : nextCursor.hashCode);

  factory ProductChangeRequestPageResponseDto.fromJson(Map<String, dynamic> json) => _$ProductChangeRequestPageResponseDtoFromJson(json);

  Map<String, dynamic> toJson() => _$ProductChangeRequestPageResponseDtoToJson(this);

  @override
  String toString() {
    return toJson().toString();
  }

}


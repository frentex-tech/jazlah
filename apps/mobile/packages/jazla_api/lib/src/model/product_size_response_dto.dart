//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:jazla_api/src/model/localized_text_response_dto.dart';
import 'package:json_annotation/json_annotation.dart';

part 'product_size_response_dto.g.dart';


@JsonSerializable(
  checked: true,
  createToJson: true,
  disallowUnrecognizedKeys: false,
  explicitToJson: true,
)
class ProductSizeResponseDto {
  /// Returns a new [ProductSizeResponseDto] instance.
  ProductSizeResponseDto({

    required  this.id,

    required  this.approxWeightGrams,

    required  this.priceHalalas,

    required  this.tag,

    required  this.isAvailable,
  });

      /// The size id (UUID): send it back to keep the size in a content edit, or as `sizeId` to change its price. Null only for a new size proposed in a change request.
  @JsonKey(
    
    name: r'id',
    required: true,
    includeIfNull: true,
  )


  final String? id;



      /// The approximate weight in grams (`8000` is 8 kg); the final weight may differ.
  @JsonKey(
    
    name: r'approxWeightGrams',
    required: true,
    includeIfNull: false,
  )


  final num approxWeightGrams;



      /// The price of this size in halalas, VAT included (`95000` is 950.00 SAR).
  @JsonKey(
    
    name: r'priceHalalas',
    required: true,
    includeIfNull: false,
  )


  final num priceHalalas;



      /// An optional label in Arabic and English, such as “Enough for an aqiqah”; null for none.
  @JsonKey(
    
    name: r'tag',
    required: true,
    includeIfNull: true,
  )


  final LocalizedTextResponseDto? tag;



      /// Whether this size can be ordered now (switched by the availability edit); null only inside a change request, where a new size starts available and a kept one keeps its availability.
  @JsonKey(
    
    name: r'isAvailable',
    required: true,
    includeIfNull: true,
  )


  final bool? isAvailable;





    @override
    bool operator ==(Object other) => identical(this, other) || other is ProductSizeResponseDto &&
      other.id == id &&
      other.approxWeightGrams == approxWeightGrams &&
      other.priceHalalas == priceHalalas &&
      other.tag == tag &&
      other.isAvailable == isAvailable;

    @override
    int get hashCode =>
        (id == null ? 0 : id.hashCode) +
        approxWeightGrams.hashCode +
        priceHalalas.hashCode +
        (tag == null ? 0 : tag.hashCode) +
        (isAvailable == null ? 0 : isAvailable.hashCode);

  factory ProductSizeResponseDto.fromJson(Map<String, dynamic> json) => _$ProductSizeResponseDtoFromJson(json);

  Map<String, dynamic> toJson() => _$ProductSizeResponseDtoToJson(this);

  @override
  String toString() {
    return toJson().toString();
  }

}


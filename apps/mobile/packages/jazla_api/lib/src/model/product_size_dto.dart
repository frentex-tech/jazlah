//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:jazla_api/src/model/localized_name_dto.dart';
import 'package:json_annotation/json_annotation.dart';

part 'product_size_dto.g.dart';


@JsonSerializable(
  checked: true,
  createToJson: true,
  disallowUnrecognizedKeys: false,
  explicitToJson: true,
)
class ProductSizeDto {
  /// Returns a new [ProductSizeDto] instance.
  ProductSizeDto({

     this.id,

    required  this.approxWeightGrams,

    required  this.priceHalalas,

     this.tag,
  });

      /// An existing size of the product to keep (its id); left out or null for a new size.
  @JsonKey(
    
    name: r'id',
    required: false,
    includeIfNull: false,
  )


  final String? id;



      /// The approximate weight in grams.
          // minimum: 1
          // maximum: 10000000
  @JsonKey(
    
    name: r'approxWeightGrams',
    required: true,
    includeIfNull: false,
  )


  final num approxWeightGrams;



      /// The price in halalas, VAT included. An existing size keeps its live price here (VALIDATION_FAILED `isLivePrice` otherwise): change it with the prices endpoint.
          // minimum: 1
          // maximum: 100000000
  @JsonKey(
    
    name: r'priceHalalas',
    required: true,
    includeIfNull: false,
  )


  final num priceHalalas;



      /// An optional label in Arabic and English, such as “يكفي لعقيقة” / “Enough for an aqiqah”; null or left out for none.
  @JsonKey(
    
    name: r'tag',
    required: false,
    includeIfNull: false,
  )


  final LocalizedNameDto? tag;





    @override
    bool operator ==(Object other) => identical(this, other) || other is ProductSizeDto &&
      other.id == id &&
      other.approxWeightGrams == approxWeightGrams &&
      other.priceHalalas == priceHalalas &&
      other.tag == tag;

    @override
    int get hashCode =>
        (id == null ? 0 : id.hashCode) +
        approxWeightGrams.hashCode +
        priceHalalas.hashCode +
        (tag == null ? 0 : tag.hashCode);

  factory ProductSizeDto.fromJson(Map<String, dynamic> json) => _$ProductSizeDtoFromJson(json);

  Map<String, dynamic> toJson() => _$ProductSizeDtoToJson(this);

  @override
  String toString() {
    return toJson().toString();
  }

}


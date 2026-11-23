//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:json_annotation/json_annotation.dart';

part 'size_price_dto.g.dart';


@JsonSerializable(
  checked: true,
  createToJson: true,
  disallowUnrecognizedKeys: false,
  explicitToJson: true,
)
class SizePriceDto {
  /// Returns a new [SizePriceDto] instance.
  SizePriceDto({

    required  this.sizeId,

    required  this.priceHalalas,
  });

      /// The id (UUID) of one of the product’s sizes (`sizes[].id` of the product); another one is VALIDATION_FAILED `isSizeOfProduct`.
  @JsonKey(
    
    name: r'sizeId',
    required: true,
    includeIfNull: false,
  )


  final String sizeId;



      /// The new price of this size, in halalas, VAT included (`89000` is 890.00 SAR); at least 1.
          // minimum: 1
          // maximum: 100000000
  @JsonKey(
    
    name: r'priceHalalas',
    required: true,
    includeIfNull: false,
  )


  final num priceHalalas;





    @override
    bool operator ==(Object other) => identical(this, other) || other is SizePriceDto &&
      other.sizeId == sizeId &&
      other.priceHalalas == priceHalalas;

    @override
    int get hashCode =>
        sizeId.hashCode +
        priceHalalas.hashCode;

  factory SizePriceDto.fromJson(Map<String, dynamic> json) => _$SizePriceDtoFromJson(json);

  Map<String, dynamic> toJson() => _$SizePriceDtoToJson(this);

  @override
  String toString() {
    return toJson().toString();
  }

}


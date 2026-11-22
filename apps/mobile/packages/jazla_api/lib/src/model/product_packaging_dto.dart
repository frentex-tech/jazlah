//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:json_annotation/json_annotation.dart';

part 'product_packaging_dto.g.dart';


@JsonSerializable(
  checked: true,
  createToJson: true,
  disallowUnrecognizedKeys: false,
  explicitToJson: true,
)
class ProductPackagingDto {
  /// Returns a new [ProductPackagingDto] instance.
  ProductPackagingDto({

    required  this.packaging,

    required  this.extraPriceHalalas,
  });

      /// The packaging: `trays`, `bags`, `vacuum`, `none`. A cutting style and a packaging an admin rule forbids together may both be offered: customers cannot choose the pair (the cart’s line price, CRT-API-1, will refuse it with INCOMPATIBLE_CUTTING_PACKAGING).
  @JsonKey(
    
    name: r'packaging',
    required: true,
    includeIfNull: false,
  unknownEnumValue: ProductPackagingDtoPackagingEnum.unknownDefaultOpenApi,
  )


  final ProductPackagingDtoPackagingEnum packaging;



      /// The extra price in halalas, VAT included (`500` is 5.00 SAR); 0 for none. A packaging the product already offers keeps its live extra price here (VALIDATION_FAILED `isLivePrice` otherwise): change it with the prices endpoint.
          // minimum: 0
          // maximum: 100000000
  @JsonKey(
    
    name: r'extraPriceHalalas',
    required: true,
    includeIfNull: false,
  )


  final num extraPriceHalalas;





    @override
    bool operator ==(Object other) => identical(this, other) || other is ProductPackagingDto &&
      other.packaging == packaging &&
      other.extraPriceHalalas == extraPriceHalalas;

    @override
    int get hashCode =>
        packaging.hashCode +
        extraPriceHalalas.hashCode;

  factory ProductPackagingDto.fromJson(Map<String, dynamic> json) => _$ProductPackagingDtoFromJson(json);

  Map<String, dynamic> toJson() => _$ProductPackagingDtoToJson(this);

  @override
  String toString() {
    return toJson().toString();
  }

}

/// The packaging: `trays`, `bags`, `vacuum`, `none`. A cutting style and a packaging an admin rule forbids together may both be offered: customers cannot choose the pair (the cart’s line price, CRT-API-1, will refuse it with INCOMPATIBLE_CUTTING_PACKAGING).
enum ProductPackagingDtoPackagingEnum {
    /// The packaging: `trays`, `bags`, `vacuum`, `none`. A cutting style and a packaging an admin rule forbids together may both be offered: customers cannot choose the pair (the cart’s line price, CRT-API-1, will refuse it with INCOMPATIBLE_CUTTING_PACKAGING).
@JsonValue(r'trays')
trays(r'trays'),
    /// The packaging: `trays`, `bags`, `vacuum`, `none`. A cutting style and a packaging an admin rule forbids together may both be offered: customers cannot choose the pair (the cart’s line price, CRT-API-1, will refuse it with INCOMPATIBLE_CUTTING_PACKAGING).
@JsonValue(r'bags')
bags(r'bags'),
    /// The packaging: `trays`, `bags`, `vacuum`, `none`. A cutting style and a packaging an admin rule forbids together may both be offered: customers cannot choose the pair (the cart’s line price, CRT-API-1, will refuse it with INCOMPATIBLE_CUTTING_PACKAGING).
@JsonValue(r'vacuum')
vacuum(r'vacuum'),
    /// The packaging: `trays`, `bags`, `vacuum`, `none`. A cutting style and a packaging an admin rule forbids together may both be offered: customers cannot choose the pair (the cart’s line price, CRT-API-1, will refuse it with INCOMPATIBLE_CUTTING_PACKAGING).
@JsonValue(r'none')
none(r'none'),
    /// The packaging: `trays`, `bags`, `vacuum`, `none`. A cutting style and a packaging an admin rule forbids together may both be offered: customers cannot choose the pair (the cart’s line price, CRT-API-1, will refuse it with INCOMPATIBLE_CUTTING_PACKAGING).
@JsonValue(r'unknown_default_open_api')
unknownDefaultOpenApi(r'unknown_default_open_api');

const ProductPackagingDtoPackagingEnum(this.value);

final String value;

@override
String toString() => value;
}



//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:json_annotation/json_annotation.dart';

part 'packaging_price_dto.g.dart';


@JsonSerializable(
  checked: true,
  createToJson: true,
  disallowUnrecognizedKeys: false,
  explicitToJson: true,
)
class PackagingPriceDto {
  /// Returns a new [PackagingPriceDto] instance.
  PackagingPriceDto({

    required  this.packaging,

    required  this.extraPriceHalalas,
  });

      /// A packaging the product offers: `trays`, `bags`, `vacuum`, `none`; another one is VALIDATION_FAILED `isPackagingOfProduct`.
  @JsonKey(
    
    name: r'packaging',
    required: true,
    includeIfNull: false,
  unknownEnumValue: PackagingPriceDtoPackagingEnum.unknownDefaultOpenApi,
  )


  final PackagingPriceDtoPackagingEnum packaging;



      /// The new extra price for this packaging, in halalas, VAT included (`500` is 5.00 SAR); 0 for no extra charge.
          // minimum: 0
          // maximum: 100000000
  @JsonKey(
    
    name: r'extraPriceHalalas',
    required: true,
    includeIfNull: false,
  )


  final num extraPriceHalalas;





    @override
    bool operator ==(Object other) => identical(this, other) || other is PackagingPriceDto &&
      other.packaging == packaging &&
      other.extraPriceHalalas == extraPriceHalalas;

    @override
    int get hashCode =>
        packaging.hashCode +
        extraPriceHalalas.hashCode;

  factory PackagingPriceDto.fromJson(Map<String, dynamic> json) => _$PackagingPriceDtoFromJson(json);

  Map<String, dynamic> toJson() => _$PackagingPriceDtoToJson(this);

  @override
  String toString() {
    return toJson().toString();
  }

}

/// A packaging the product offers: `trays`, `bags`, `vacuum`, `none`; another one is VALIDATION_FAILED `isPackagingOfProduct`.
enum PackagingPriceDtoPackagingEnum {
    /// A packaging the product offers: `trays`, `bags`, `vacuum`, `none`; another one is VALIDATION_FAILED `isPackagingOfProduct`.
@JsonValue(r'trays')
trays(r'trays'),
    /// A packaging the product offers: `trays`, `bags`, `vacuum`, `none`; another one is VALIDATION_FAILED `isPackagingOfProduct`.
@JsonValue(r'bags')
bags(r'bags'),
    /// A packaging the product offers: `trays`, `bags`, `vacuum`, `none`; another one is VALIDATION_FAILED `isPackagingOfProduct`.
@JsonValue(r'vacuum')
vacuum(r'vacuum'),
    /// A packaging the product offers: `trays`, `bags`, `vacuum`, `none`; another one is VALIDATION_FAILED `isPackagingOfProduct`.
@JsonValue(r'none')
none(r'none'),
    /// A packaging the product offers: `trays`, `bags`, `vacuum`, `none`; another one is VALIDATION_FAILED `isPackagingOfProduct`.
@JsonValue(r'unknown_default_open_api')
unknownDefaultOpenApi(r'unknown_default_open_api');

const PackagingPriceDtoPackagingEnum(this.value);

final String value;

@override
String toString() => value;
}



//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:jazla_api/src/model/cutting_price_dto.dart';
import 'package:jazla_api/src/model/packaging_price_dto.dart';
import 'package:jazla_api/src/model/size_price_dto.dart';
import 'package:json_annotation/json_annotation.dart';

part 'change_product_prices_dto.g.dart';


@JsonSerializable(
  checked: true,
  createToJson: true,
  disallowUnrecognizedKeys: false,
  explicitToJson: true,
)
class ChangeProductPricesDto {
  /// Returns a new [ChangeProductPricesDto] instance.
  ChangeProductPricesDto({

     this.sizes,

     this.cuttings,

     this.packagings,
  });

      /// New size prices, each size at most once (VALIDATION_FAILED `isNotRepeated` on `sizes.<i>.sizeId`); left out or empty: no size price changes.
  @JsonKey(
    
    name: r'sizes',
    required: false,
    includeIfNull: false,
  )


  final List<SizePriceDto>? sizes;



      /// New cutting style extra prices, each cutting style at most once (VALIDATION_FAILED `isNotRepeated` on `cuttings.<i>.cuttingStyleId`); left out or empty: no cutting price changes.
  @JsonKey(
    
    name: r'cuttings',
    required: false,
    includeIfNull: false,
  )


  final List<CuttingPriceDto>? cuttings;



      /// New packaging extra prices, each packaging at most once (VALIDATION_FAILED `isNotRepeated` on `packagings.<i>.packaging`); left out or empty: no packaging price changes.
  @JsonKey(
    
    name: r'packagings',
    required: false,
    includeIfNull: false,
  )


  final List<PackagingPriceDto>? packagings;





    @override
    bool operator ==(Object other) => identical(this, other) || other is ChangeProductPricesDto &&
      other.sizes == sizes &&
      other.cuttings == cuttings &&
      other.packagings == packagings;

    @override
    int get hashCode =>
        sizes.hashCode +
        cuttings.hashCode +
        packagings.hashCode;

  factory ChangeProductPricesDto.fromJson(Map<String, dynamic> json) => _$ChangeProductPricesDtoFromJson(json);

  Map<String, dynamic> toJson() => _$ChangeProductPricesDtoToJson(this);

  @override
  String toString() {
    return toJson().toString();
  }

}


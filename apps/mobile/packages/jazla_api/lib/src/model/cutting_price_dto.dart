//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:json_annotation/json_annotation.dart';

part 'cutting_price_dto.g.dart';


@JsonSerializable(
  checked: true,
  createToJson: true,
  disallowUnrecognizedKeys: false,
  explicitToJson: true,
)
class CuttingPriceDto {
  /// Returns a new [CuttingPriceDto] instance.
  CuttingPriceDto({

    required  this.cuttingStyleId,

    required  this.extraPriceHalalas,
  });

      /// The id (UUID) of a cutting style the product offers; another one is VALIDATION_FAILED `isCuttingOfProduct`.
  @JsonKey(
    
    name: r'cuttingStyleId',
    required: true,
    includeIfNull: false,
  )


  final String cuttingStyleId;



      /// The new extra price for this cutting style, in halalas, VAT included (`1500` is 15.00 SAR); 0 for no extra charge.
          // minimum: 0
          // maximum: 100000000
  @JsonKey(
    
    name: r'extraPriceHalalas',
    required: true,
    includeIfNull: false,
  )


  final num extraPriceHalalas;





    @override
    bool operator ==(Object other) => identical(this, other) || other is CuttingPriceDto &&
      other.cuttingStyleId == cuttingStyleId &&
      other.extraPriceHalalas == extraPriceHalalas;

    @override
    int get hashCode =>
        cuttingStyleId.hashCode +
        extraPriceHalalas.hashCode;

  factory CuttingPriceDto.fromJson(Map<String, dynamic> json) => _$CuttingPriceDtoFromJson(json);

  Map<String, dynamic> toJson() => _$CuttingPriceDtoToJson(this);

  @override
  String toString() {
    return toJson().toString();
  }

}


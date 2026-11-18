//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:json_annotation/json_annotation.dart';

part 'product_cutting_dto.g.dart';


@JsonSerializable(
  checked: true,
  createToJson: true,
  disallowUnrecognizedKeys: false,
  explicitToJson: true,
)
class ProductCuttingDto {
  /// Returns a new [ProductCuttingDto] instance.
  ProductCuttingDto({

    required  this.cuttingStyleId,

    required  this.extraPriceHalalas,
  });

      /// The id (UUID) of an active cutting style; an inactive or unknown one is VALIDATION_FAILED `isActiveCuttingStyle`.
  @JsonKey(
    
    name: r'cuttingStyleId',
    required: true,
    includeIfNull: false,
  )


  final String cuttingStyleId;



      /// The extra price in halalas, VAT included; 0 for none. A cutting style the product already offers keeps its live extra price here (VALIDATION_FAILED `isLivePrice` otherwise): change it with the prices endpoint.
          // minimum: 0
          // maximum: 100000000
  @JsonKey(
    
    name: r'extraPriceHalalas',
    required: true,
    includeIfNull: false,
  )


  final num extraPriceHalalas;





    @override
    bool operator ==(Object other) => identical(this, other) || other is ProductCuttingDto &&
      other.cuttingStyleId == cuttingStyleId &&
      other.extraPriceHalalas == extraPriceHalalas;

    @override
    int get hashCode =>
        cuttingStyleId.hashCode +
        extraPriceHalalas.hashCode;

  factory ProductCuttingDto.fromJson(Map<String, dynamic> json) => _$ProductCuttingDtoFromJson(json);

  Map<String, dynamic> toJson() => _$ProductCuttingDtoToJson(this);

  @override
  String toString() {
    return toJson().toString();
  }

}


//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:jazla_api/src/model/localized_text_response_dto.dart';
import 'package:json_annotation/json_annotation.dart';

part 'public_product_cutting_response_dto.g.dart';


@JsonSerializable(
  checked: true,
  createToJson: true,
  disallowUnrecognizedKeys: false,
  explicitToJson: true,
)
class PublicProductCuttingResponseDto {
  /// Returns a new [PublicProductCuttingResponseDto] instance.
  PublicProductCuttingResponseDto({

    required  this.cuttingStyleId,

    required  this.name,

    required  this.extraPriceHalalas,
  });

      /// The id (UUID) of the cutting style: send it as the chosen cutting.
  @JsonKey(
    
    name: r'cuttingStyleId',
    required: true,
    includeIfNull: false,
  )


  final String cuttingStyleId;



      /// The cutting style’s name in Arabic and English.
  @JsonKey(
    
    name: r'name',
    required: true,
    includeIfNull: false,
  )


  final LocalizedTextResponseDto name;



      /// The extra price for this cutting style, in halalas, VAT included (`1500` is 15.00 SAR); 0 for no extra charge.
  @JsonKey(
    
    name: r'extraPriceHalalas',
    required: true,
    includeIfNull: false,
  )


  final num extraPriceHalalas;





    @override
    bool operator ==(Object other) => identical(this, other) || other is PublicProductCuttingResponseDto &&
      other.cuttingStyleId == cuttingStyleId &&
      other.name == name &&
      other.extraPriceHalalas == extraPriceHalalas;

    @override
    int get hashCode =>
        cuttingStyleId.hashCode +
        name.hashCode +
        extraPriceHalalas.hashCode;

  factory PublicProductCuttingResponseDto.fromJson(Map<String, dynamic> json) => _$PublicProductCuttingResponseDtoFromJson(json);

  Map<String, dynamic> toJson() => _$PublicProductCuttingResponseDtoToJson(this);

  @override
  String toString() {
    return toJson().toString();
  }

}


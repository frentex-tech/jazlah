//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:json_annotation/json_annotation.dart';

part 'product_packaging_response_dto.g.dart';


@JsonSerializable(
  checked: true,
  createToJson: true,
  disallowUnrecognizedKeys: false,
  explicitToJson: true,
)
class ProductPackagingResponseDto {
  /// Returns a new [ProductPackagingResponseDto] instance.
  ProductPackagingResponseDto({

    required  this.packaging,

    required  this.extraPriceHalalas,
  });

      /// The packaging: `trays`, `bags`, `vacuum`, `none`.
  @JsonKey(
    
    name: r'packaging',
    required: true,
    includeIfNull: false,
  unknownEnumValue: ProductPackagingResponseDtoPackagingEnum.unknownDefaultOpenApi,
  )


  final ProductPackagingResponseDtoPackagingEnum packaging;



      /// The extra price for this packaging, in halalas, VAT included (`500` is 5.00 SAR); 0 for no extra charge.
  @JsonKey(
    
    name: r'extraPriceHalalas',
    required: true,
    includeIfNull: false,
  )


  final num extraPriceHalalas;





    @override
    bool operator ==(Object other) => identical(this, other) || other is ProductPackagingResponseDto &&
      other.packaging == packaging &&
      other.extraPriceHalalas == extraPriceHalalas;

    @override
    int get hashCode =>
        packaging.hashCode +
        extraPriceHalalas.hashCode;

  factory ProductPackagingResponseDto.fromJson(Map<String, dynamic> json) => _$ProductPackagingResponseDtoFromJson(json);

  Map<String, dynamic> toJson() => _$ProductPackagingResponseDtoToJson(this);

  @override
  String toString() {
    return toJson().toString();
  }

}

/// The packaging: `trays`, `bags`, `vacuum`, `none`.
enum ProductPackagingResponseDtoPackagingEnum {
    /// The packaging: `trays`, `bags`, `vacuum`, `none`.
@JsonValue(r'trays')
trays(r'trays'),
    /// The packaging: `trays`, `bags`, `vacuum`, `none`.
@JsonValue(r'bags')
bags(r'bags'),
    /// The packaging: `trays`, `bags`, `vacuum`, `none`.
@JsonValue(r'vacuum')
vacuum(r'vacuum'),
    /// The packaging: `trays`, `bags`, `vacuum`, `none`.
@JsonValue(r'none')
none(r'none'),
    /// The packaging: `trays`, `bags`, `vacuum`, `none`.
@JsonValue(r'unknown_default_open_api')
unknownDefaultOpenApi(r'unknown_default_open_api');

const ProductPackagingResponseDtoPackagingEnum(this.value);

final String value;

@override
String toString() => value;
}



//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:jazla_api/src/model/named_reference_response_dto.dart';
import 'package:json_annotation/json_annotation.dart';

part 'vendor_incompatibility_response_dto.g.dart';


@JsonSerializable(
  checked: true,
  createToJson: true,
  disallowUnrecognizedKeys: false,
  explicitToJson: true,
)
class VendorIncompatibilityResponseDto {
  /// Returns a new [VendorIncompatibilityResponseDto] instance.
  VendorIncompatibilityResponseDto({

    required  this.cuttingStyle,

    required  this.packaging,
  });

      /// The cutting style (active), with its Arabic and English name.
  @JsonKey(
    
    name: r'cuttingStyle',
    required: true,
    includeIfNull: false,
  )


  final NamedReferenceResponseDto cuttingStyle;



      /// The packaging it cannot be packed in: `trays`, `bags`, `vacuum`, `none`.
  @JsonKey(
    
    name: r'packaging',
    required: true,
    includeIfNull: false,
  unknownEnumValue: VendorIncompatibilityResponseDtoPackagingEnum.unknownDefaultOpenApi,
  )


  final VendorIncompatibilityResponseDtoPackagingEnum packaging;





    @override
    bool operator ==(Object other) => identical(this, other) || other is VendorIncompatibilityResponseDto &&
      other.cuttingStyle == cuttingStyle &&
      other.packaging == packaging;

    @override
    int get hashCode =>
        cuttingStyle.hashCode +
        packaging.hashCode;

  factory VendorIncompatibilityResponseDto.fromJson(Map<String, dynamic> json) => _$VendorIncompatibilityResponseDtoFromJson(json);

  Map<String, dynamic> toJson() => _$VendorIncompatibilityResponseDtoToJson(this);

  @override
  String toString() {
    return toJson().toString();
  }

}

/// The packaging it cannot be packed in: `trays`, `bags`, `vacuum`, `none`.
enum VendorIncompatibilityResponseDtoPackagingEnum {
    /// The packaging it cannot be packed in: `trays`, `bags`, `vacuum`, `none`.
@JsonValue(r'trays')
trays(r'trays'),
    /// The packaging it cannot be packed in: `trays`, `bags`, `vacuum`, `none`.
@JsonValue(r'bags')
bags(r'bags'),
    /// The packaging it cannot be packed in: `trays`, `bags`, `vacuum`, `none`.
@JsonValue(r'vacuum')
vacuum(r'vacuum'),
    /// The packaging it cannot be packed in: `trays`, `bags`, `vacuum`, `none`.
@JsonValue(r'none')
none(r'none'),
    /// The packaging it cannot be packed in: `trays`, `bags`, `vacuum`, `none`.
@JsonValue(r'unknown_default_open_api')
unknownDefaultOpenApi(r'unknown_default_open_api');

const VendorIncompatibilityResponseDtoPackagingEnum(this.value);

final String value;

@override
String toString() => value;
}



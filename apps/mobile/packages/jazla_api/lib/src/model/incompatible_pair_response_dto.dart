//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:json_annotation/json_annotation.dart';

part 'incompatible_pair_response_dto.g.dart';


@JsonSerializable(
  checked: true,
  createToJson: true,
  disallowUnrecognizedKeys: false,
  explicitToJson: true,
)
class IncompatiblePairResponseDto {
  /// Returns a new [IncompatiblePairResponseDto] instance.
  IncompatiblePairResponseDto({

    required  this.cuttingStyleId,

    required  this.packaging,
  });

      /// The id (UUID) of one of the product’s cutting styles.
  @JsonKey(
    
    name: r'cuttingStyleId',
    required: true,
    includeIfNull: false,
  )


  final String cuttingStyleId;



      /// One of the product’s packagings, not allowed with that cutting style.
  @JsonKey(
    
    name: r'packaging',
    required: true,
    includeIfNull: false,
  unknownEnumValue: IncompatiblePairResponseDtoPackagingEnum.unknownDefaultOpenApi,
  )


  final IncompatiblePairResponseDtoPackagingEnum packaging;





    @override
    bool operator ==(Object other) => identical(this, other) || other is IncompatiblePairResponseDto &&
      other.cuttingStyleId == cuttingStyleId &&
      other.packaging == packaging;

    @override
    int get hashCode =>
        cuttingStyleId.hashCode +
        packaging.hashCode;

  factory IncompatiblePairResponseDto.fromJson(Map<String, dynamic> json) => _$IncompatiblePairResponseDtoFromJson(json);

  Map<String, dynamic> toJson() => _$IncompatiblePairResponseDtoToJson(this);

  @override
  String toString() {
    return toJson().toString();
  }

}

/// One of the product’s packagings, not allowed with that cutting style.
enum IncompatiblePairResponseDtoPackagingEnum {
    /// One of the product’s packagings, not allowed with that cutting style.
@JsonValue(r'trays')
trays(r'trays'),
    /// One of the product’s packagings, not allowed with that cutting style.
@JsonValue(r'bags')
bags(r'bags'),
    /// One of the product’s packagings, not allowed with that cutting style.
@JsonValue(r'vacuum')
vacuum(r'vacuum'),
    /// One of the product’s packagings, not allowed with that cutting style.
@JsonValue(r'none')
none(r'none'),
    /// One of the product’s packagings, not allowed with that cutting style.
@JsonValue(r'unknown_default_open_api')
unknownDefaultOpenApi(r'unknown_default_open_api');

const IncompatiblePairResponseDtoPackagingEnum(this.value);

final String value;

@override
String toString() => value;
}



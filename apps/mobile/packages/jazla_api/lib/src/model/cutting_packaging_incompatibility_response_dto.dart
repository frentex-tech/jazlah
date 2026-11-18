//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:json_annotation/json_annotation.dart';

part 'cutting_packaging_incompatibility_response_dto.g.dart';


@JsonSerializable(
  checked: true,
  createToJson: true,
  disallowUnrecognizedKeys: false,
  explicitToJson: true,
)
class CuttingPackagingIncompatibilityResponseDto {
  /// Returns a new [CuttingPackagingIncompatibilityResponseDto] instance.
  CuttingPackagingIncompatibilityResponseDto({

    required  this.id,

    required  this.cuttingStyleId,

    required  this.packaging,

    required  this.createdAt,
  });

      /// The rule’s id (UUID); delete the rule with it.
  @JsonKey(
    
    name: r'id',
    required: true,
    includeIfNull: false,
  )


  final String id;



      /// The id (UUID) of the cutting style the rule is about.
  @JsonKey(
    
    name: r'cuttingStyleId',
    required: true,
    includeIfNull: false,
  )


  final String cuttingStyleId;



      /// The packaging the cutting style cannot be packed in.
  @JsonKey(
    
    name: r'packaging',
    required: true,
    includeIfNull: false,
  unknownEnumValue: CuttingPackagingIncompatibilityResponseDtoPackagingEnum.unknownDefaultOpenApi,
  )


  final CuttingPackagingIncompatibilityResponseDtoPackagingEnum packaging;



      /// When the rule was added, UTC ISO 8601.
  @JsonKey(
    
    name: r'createdAt',
    required: true,
    includeIfNull: false,
  )


  final DateTime createdAt;





    @override
    bool operator ==(Object other) => identical(this, other) || other is CuttingPackagingIncompatibilityResponseDto &&
      other.id == id &&
      other.cuttingStyleId == cuttingStyleId &&
      other.packaging == packaging &&
      other.createdAt == createdAt;

    @override
    int get hashCode =>
        id.hashCode +
        cuttingStyleId.hashCode +
        packaging.hashCode +
        createdAt.hashCode;

  factory CuttingPackagingIncompatibilityResponseDto.fromJson(Map<String, dynamic> json) => _$CuttingPackagingIncompatibilityResponseDtoFromJson(json);

  Map<String, dynamic> toJson() => _$CuttingPackagingIncompatibilityResponseDtoToJson(this);

  @override
  String toString() {
    return toJson().toString();
  }

}

/// The packaging the cutting style cannot be packed in.
enum CuttingPackagingIncompatibilityResponseDtoPackagingEnum {
    /// The packaging the cutting style cannot be packed in.
@JsonValue(r'trays')
trays(r'trays'),
    /// The packaging the cutting style cannot be packed in.
@JsonValue(r'bags')
bags(r'bags'),
    /// The packaging the cutting style cannot be packed in.
@JsonValue(r'vacuum')
vacuum(r'vacuum'),
    /// The packaging the cutting style cannot be packed in.
@JsonValue(r'none')
none(r'none'),
    /// The packaging the cutting style cannot be packed in.
@JsonValue(r'unknown_default_open_api')
unknownDefaultOpenApi(r'unknown_default_open_api');

const CuttingPackagingIncompatibilityResponseDtoPackagingEnum(this.value);

final String value;

@override
String toString() => value;
}



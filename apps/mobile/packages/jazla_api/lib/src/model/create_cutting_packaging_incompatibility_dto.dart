//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:json_annotation/json_annotation.dart';

part 'create_cutting_packaging_incompatibility_dto.g.dart';


@JsonSerializable(
  checked: true,
  createToJson: true,
  disallowUnrecognizedKeys: false,
  explicitToJson: true,
)
class CreateCuttingPackagingIncompatibilityDto {
  /// Returns a new [CreateCuttingPackagingIncompatibilityDto] instance.
  CreateCuttingPackagingIncompatibilityDto({

    required  this.cuttingStyleId,

    required  this.packaging,
  });

      /// The id (UUID) of an active cutting style (GET /v1/admin/lists/cutting-styles); another one is VALIDATION_FAILED `isActiveCuttingStyle`.
  @JsonKey(
    
    name: r'cuttingStyleId',
    required: true,
    includeIfNull: false,
  )


  final String cuttingStyleId;



      /// The packaging this cutting style cannot be packed in: `trays`, `bags`, `vacuum` or `none`.
  @JsonKey(
    
    name: r'packaging',
    required: true,
    includeIfNull: false,
  unknownEnumValue: CreateCuttingPackagingIncompatibilityDtoPackagingEnum.unknownDefaultOpenApi,
  )


  final CreateCuttingPackagingIncompatibilityDtoPackagingEnum packaging;





    @override
    bool operator ==(Object other) => identical(this, other) || other is CreateCuttingPackagingIncompatibilityDto &&
      other.cuttingStyleId == cuttingStyleId &&
      other.packaging == packaging;

    @override
    int get hashCode =>
        cuttingStyleId.hashCode +
        packaging.hashCode;

  factory CreateCuttingPackagingIncompatibilityDto.fromJson(Map<String, dynamic> json) => _$CreateCuttingPackagingIncompatibilityDtoFromJson(json);

  Map<String, dynamic> toJson() => _$CreateCuttingPackagingIncompatibilityDtoToJson(this);

  @override
  String toString() {
    return toJson().toString();
  }

}

/// The packaging this cutting style cannot be packed in: `trays`, `bags`, `vacuum` or `none`.
enum CreateCuttingPackagingIncompatibilityDtoPackagingEnum {
    /// The packaging this cutting style cannot be packed in: `trays`, `bags`, `vacuum` or `none`.
@JsonValue(r'trays')
trays(r'trays'),
    /// The packaging this cutting style cannot be packed in: `trays`, `bags`, `vacuum` or `none`.
@JsonValue(r'bags')
bags(r'bags'),
    /// The packaging this cutting style cannot be packed in: `trays`, `bags`, `vacuum` or `none`.
@JsonValue(r'vacuum')
vacuum(r'vacuum'),
    /// The packaging this cutting style cannot be packed in: `trays`, `bags`, `vacuum` or `none`.
@JsonValue(r'none')
none(r'none'),
    /// The packaging this cutting style cannot be packed in: `trays`, `bags`, `vacuum` or `none`.
@JsonValue(r'unknown_default_open_api')
unknownDefaultOpenApi(r'unknown_default_open_api');

const CreateCuttingPackagingIncompatibilityDtoPackagingEnum(this.value);

final String value;

@override
String toString() => value;
}



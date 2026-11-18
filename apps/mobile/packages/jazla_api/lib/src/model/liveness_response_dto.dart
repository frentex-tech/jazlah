//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:json_annotation/json_annotation.dart';

part 'liveness_response_dto.g.dart';


@JsonSerializable(
  checked: true,
  createToJson: true,
  disallowUnrecognizedKeys: false,
  explicitToJson: true,
)
class LivenessResponseDto {
  /// Returns a new [LivenessResponseDto] instance.
  LivenessResponseDto({

    required  this.status,
  });

      /// Always ok: the process answers.
  @JsonKey(
    
    name: r'status',
    required: true,
    includeIfNull: false,
  unknownEnumValue: LivenessResponseDtoStatusEnum.unknownDefaultOpenApi,
  )


  final LivenessResponseDtoStatusEnum status;





    @override
    bool operator ==(Object other) => identical(this, other) || other is LivenessResponseDto &&
      other.status == status;

    @override
    int get hashCode =>
        status.hashCode;

  factory LivenessResponseDto.fromJson(Map<String, dynamic> json) => _$LivenessResponseDtoFromJson(json);

  Map<String, dynamic> toJson() => _$LivenessResponseDtoToJson(this);

  @override
  String toString() {
    return toJson().toString();
  }

}

/// Always ok: the process answers.
enum LivenessResponseDtoStatusEnum {
    /// Always ok: the process answers.
@JsonValue(r'ok')
ok(r'ok'),
    /// Always ok: the process answers.
@JsonValue(r'unknown_default_open_api')
unknownDefaultOpenApi(r'unknown_default_open_api');

const LivenessResponseDtoStatusEnum(this.value);

final String value;

@override
String toString() => value;
}



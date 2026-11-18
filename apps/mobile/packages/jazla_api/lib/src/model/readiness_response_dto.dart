//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:jazla_api/src/model/readiness_checks_dto.dart';
import 'package:json_annotation/json_annotation.dart';

part 'readiness_response_dto.g.dart';


@JsonSerializable(
  checked: true,
  createToJson: true,
  disallowUnrecognizedKeys: false,
  explicitToJson: true,
)
class ReadinessResponseDto {
  /// Returns a new [ReadinessResponseDto] instance.
  ReadinessResponseDto({

    required  this.status,

    required  this.checks,

     this.draining,
  });

      /// ok (HTTP 200) when every dependency is up; unavailable (HTTP 503) when one is down or the instance is shutting down.
  @JsonKey(
    
    name: r'status',
    required: true,
    includeIfNull: false,
  unknownEnumValue: ReadinessResponseDtoStatusEnum.unknownDefaultOpenApi,
  )


  final ReadinessResponseDtoStatusEnum status;



      /// The answer of each dependency.
  @JsonKey(
    
    name: r'checks',
    required: true,
    includeIfNull: false,
  )


  final ReadinessChecksDto checks;



      /// Present, true, while the instance shuts down: status is then unavailable (HTTP 503) whatever the checks say.
  @JsonKey(
    
    name: r'draining',
    required: false,
    includeIfNull: false,
  )


  final bool? draining;





    @override
    bool operator ==(Object other) => identical(this, other) || other is ReadinessResponseDto &&
      other.status == status &&
      other.checks == checks &&
      other.draining == draining;

    @override
    int get hashCode =>
        status.hashCode +
        checks.hashCode +
        draining.hashCode;

  factory ReadinessResponseDto.fromJson(Map<String, dynamic> json) => _$ReadinessResponseDtoFromJson(json);

  Map<String, dynamic> toJson() => _$ReadinessResponseDtoToJson(this);

  @override
  String toString() {
    return toJson().toString();
  }

}

/// ok (HTTP 200) when every dependency is up; unavailable (HTTP 503) when one is down or the instance is shutting down.
enum ReadinessResponseDtoStatusEnum {
    /// ok (HTTP 200) when every dependency is up; unavailable (HTTP 503) when one is down or the instance is shutting down.
@JsonValue(r'ok')
ok(r'ok'),
    /// ok (HTTP 200) when every dependency is up; unavailable (HTTP 503) when one is down or the instance is shutting down.
@JsonValue(r'unavailable')
unavailable(r'unavailable'),
    /// ok (HTTP 200) when every dependency is up; unavailable (HTTP 503) when one is down or the instance is shutting down.
@JsonValue(r'unknown_default_open_api')
unknownDefaultOpenApi(r'unknown_default_open_api');

const ReadinessResponseDtoStatusEnum(this.value);

final String value;

@override
String toString() => value;
}



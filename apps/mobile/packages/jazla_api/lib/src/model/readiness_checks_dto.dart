//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:json_annotation/json_annotation.dart';

part 'readiness_checks_dto.g.dart';


@JsonSerializable(
  checked: true,
  createToJson: true,
  disallowUnrecognizedKeys: false,
  explicitToJson: true,
)
class ReadinessChecksDto {
  /// Returns a new [ReadinessChecksDto] instance.
  ReadinessChecksDto({

    required  this.database,

    required  this.redis,
  });

      /// Whether PostgreSQL answered.
  @JsonKey(
    
    name: r'database',
    required: true,
    includeIfNull: false,
  unknownEnumValue: ReadinessChecksDtoDatabaseEnum.unknownDefaultOpenApi,
  )


  final ReadinessChecksDtoDatabaseEnum database;



      /// Whether Redis answered.
  @JsonKey(
    
    name: r'redis',
    required: true,
    includeIfNull: false,
  unknownEnumValue: ReadinessChecksDtoRedisEnum.unknownDefaultOpenApi,
  )


  final ReadinessChecksDtoRedisEnum redis;





    @override
    bool operator ==(Object other) => identical(this, other) || other is ReadinessChecksDto &&
      other.database == database &&
      other.redis == redis;

    @override
    int get hashCode =>
        database.hashCode +
        redis.hashCode;

  factory ReadinessChecksDto.fromJson(Map<String, dynamic> json) => _$ReadinessChecksDtoFromJson(json);

  Map<String, dynamic> toJson() => _$ReadinessChecksDtoToJson(this);

  @override
  String toString() {
    return toJson().toString();
  }

}

/// Whether PostgreSQL answered.
enum ReadinessChecksDtoDatabaseEnum {
    /// Whether PostgreSQL answered.
@JsonValue(r'up')
up(r'up'),
    /// Whether PostgreSQL answered.
@JsonValue(r'down')
down(r'down'),
    /// Whether PostgreSQL answered.
@JsonValue(r'unknown_default_open_api')
unknownDefaultOpenApi(r'unknown_default_open_api');

const ReadinessChecksDtoDatabaseEnum(this.value);

final String value;

@override
String toString() => value;
}


/// Whether Redis answered.
enum ReadinessChecksDtoRedisEnum {
    /// Whether Redis answered.
@JsonValue(r'up')
up(r'up'),
    /// Whether Redis answered.
@JsonValue(r'down')
down(r'down'),
    /// Whether Redis answered.
@JsonValue(r'unknown_default_open_api')
unknownDefaultOpenApi(r'unknown_default_open_api');

const ReadinessChecksDtoRedisEnum(this.value);

final String value;

@override
String toString() => value;
}



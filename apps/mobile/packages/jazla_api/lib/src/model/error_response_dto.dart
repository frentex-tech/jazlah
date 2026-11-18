//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:jazla_api/src/model/error_code.dart';
import 'package:jazla_api/src/model/error_response_dto_details.dart';
import 'package:json_annotation/json_annotation.dart';

part 'error_response_dto.g.dart';


@JsonSerializable(
  checked: true,
  createToJson: true,
  disallowUnrecognizedKeys: false,
  explicitToJson: true,
)
class ErrorResponseDto {
  /// Returns a new [ErrorResponseDto] instance.
  ErrorResponseDto({

    required  this.code,

    required  this.message,

     this.details,

    required  this.requestId,
  });

      /// Stable error code. Clients branch on it; it is never renamed or reused.
  @JsonKey(
    
    name: r'code',
    required: true,
    includeIfNull: false,
  unknownEnumValue: ErrorCode.unknownDefaultOpenApi,
  )


  final ErrorCode code;



      /// Message for a person, in Arabic unless Accept-Language prefers English. Never branch on it.
  @JsonKey(
    
    name: r'message',
    required: true,
    includeIfNull: false,
  )


  final String message;



  @JsonKey(
    
    name: r'details',
    required: false,
    includeIfNull: false,
  )


  final ErrorResponseDtoDetails? details;



      /// Id of the request, also in the x-request-id response header. Quote it when reporting a problem.
  @JsonKey(
    
    name: r'requestId',
    required: true,
    includeIfNull: false,
  )


  final String requestId;





    @override
    bool operator ==(Object other) => identical(this, other) || other is ErrorResponseDto &&
      other.code == code &&
      other.message == message &&
      other.details == details &&
      other.requestId == requestId;

    @override
    int get hashCode =>
        code.hashCode +
        message.hashCode +
        details.hashCode +
        requestId.hashCode;

  factory ErrorResponseDto.fromJson(Map<String, dynamic> json) => _$ErrorResponseDtoFromJson(json);

  Map<String, dynamic> toJson() => _$ErrorResponseDtoToJson(this);

  @override
  String toString() {
    return toJson().toString();
  }

}


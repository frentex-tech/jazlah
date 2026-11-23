//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:json_annotation/json_annotation.dart';

part 'otp_requested_response_dto.g.dart';


@JsonSerializable(
  checked: true,
  createToJson: true,
  disallowUnrecognizedKeys: false,
  explicitToJson: true,
)
class OtpRequestedResponseDto {
  /// Returns a new [OtpRequestedResponseDto] instance.
  OtpRequestedResponseDto({

    required  this.expiresInSeconds,

    required  this.resendAfterSeconds,
  });

      /// How long the code can be used from now, in seconds (300 by default; between 60 and 900). After that, verifying answers OTP_EXPIRED.
          // minimum: 60
          // maximum: 900
  @JsonKey(
    
    name: r'expiresInSeconds',
    required: true,
    includeIfNull: false,
  )


  final num expiresInSeconds;



      /// How long to wait before offering \"Resend code\", in seconds (60 by default; between 1 and 600). Asking earlier answers RATE_LIMITED.
          // minimum: 1
          // maximum: 600
  @JsonKey(
    
    name: r'resendAfterSeconds',
    required: true,
    includeIfNull: false,
  )


  final num resendAfterSeconds;





    @override
    bool operator ==(Object other) => identical(this, other) || other is OtpRequestedResponseDto &&
      other.expiresInSeconds == expiresInSeconds &&
      other.resendAfterSeconds == resendAfterSeconds;

    @override
    int get hashCode =>
        expiresInSeconds.hashCode +
        resendAfterSeconds.hashCode;

  factory OtpRequestedResponseDto.fromJson(Map<String, dynamic> json) => _$OtpRequestedResponseDtoFromJson(json);

  Map<String, dynamic> toJson() => _$OtpRequestedResponseDtoToJson(this);

  @override
  String toString() {
    return toJson().toString();
  }

}


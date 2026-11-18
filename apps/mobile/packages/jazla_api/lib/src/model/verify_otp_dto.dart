//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:json_annotation/json_annotation.dart';

part 'verify_otp_dto.g.dart';


@JsonSerializable(
  checked: true,
  createToJson: true,
  disallowUnrecognizedKeys: false,
  explicitToJson: true,
)
class VerifyOtpDto {
  /// Returns a new [VerifyOtpDto] instance.
  VerifyOtpDto({

    required  this.phone,

    required  this.audience,

    required  this.code,

    required  this.devicePlatform,

     this.deviceName,
  });

      /// The phone number the code was requested for, in any form the request accepted (05…, 5…, 9665…, +9665…; Latin or Arabic digits).
  @JsonKey(
    
    name: r'phone',
    required: true,
    includeIfNull: false,
  )


  final String phone;



      /// The audience the code was requested for; a code works only for its own audience.
  @JsonKey(
    
    name: r'audience',
    required: true,
    includeIfNull: false,
  unknownEnumValue: VerifyOtpDtoAudienceEnum.unknownDefaultOpenApi,
  )


  final VerifyOtpDtoAudienceEnum audience;



      /// The code from the message: 4 to 8 digits, Latin or Arabic (٠ to ٩, ۰ to ۹). Surrounding spaces and invisible format characters (direction marks, zero-width characters) are ignored. The SMS code has 6 digits by default.
  @JsonKey(
    
    name: r'code',
    required: true,
    includeIfNull: false,
  )


  final String code;



      /// The kind of client signing in: `ios` or `android` for the customer app, `web` for the dashboards and the customer web.
  @JsonKey(
    
    name: r'devicePlatform',
    required: true,
    includeIfNull: false,
  unknownEnumValue: VerifyOtpDtoDevicePlatformEnum.unknownDefaultOpenApi,
  )


  final VerifyOtpDtoDevicePlatformEnum devicePlatform;



      /// An optional name for the device (1 to 100 characters), stored with the session to tell sessions apart.
  @JsonKey(
    
    name: r'deviceName',
    required: false,
    includeIfNull: false,
  )


  final String? deviceName;





    @override
    bool operator ==(Object other) => identical(this, other) || other is VerifyOtpDto &&
      other.phone == phone &&
      other.audience == audience &&
      other.code == code &&
      other.devicePlatform == devicePlatform &&
      other.deviceName == deviceName;

    @override
    int get hashCode =>
        phone.hashCode +
        audience.hashCode +
        code.hashCode +
        devicePlatform.hashCode +
        deviceName.hashCode;

  factory VerifyOtpDto.fromJson(Map<String, dynamic> json) => _$VerifyOtpDtoFromJson(json);

  Map<String, dynamic> toJson() => _$VerifyOtpDtoToJson(this);

  @override
  String toString() {
    return toJson().toString();
  }

}

/// The audience the code was requested for; a code works only for its own audience.
enum VerifyOtpDtoAudienceEnum {
    /// The audience the code was requested for; a code works only for its own audience.
@JsonValue(r'customer')
customer(r'customer'),
    /// The audience the code was requested for; a code works only for its own audience.
@JsonValue(r'vendor')
vendor(r'vendor'),
    /// The audience the code was requested for; a code works only for its own audience.
@JsonValue(r'kitchen')
kitchen(r'kitchen'),
    /// The audience the code was requested for; a code works only for its own audience.
@JsonValue(r'admin')
admin(r'admin'),
    /// The audience the code was requested for; a code works only for its own audience.
@JsonValue(r'unknown_default_open_api')
unknownDefaultOpenApi(r'unknown_default_open_api');

const VerifyOtpDtoAudienceEnum(this.value);

final String value;

@override
String toString() => value;
}


/// The kind of client signing in: `ios` or `android` for the customer app, `web` for the dashboards and the customer web.
enum VerifyOtpDtoDevicePlatformEnum {
    /// The kind of client signing in: `ios` or `android` for the customer app, `web` for the dashboards and the customer web.
@JsonValue(r'ios')
ios(r'ios'),
    /// The kind of client signing in: `ios` or `android` for the customer app, `web` for the dashboards and the customer web.
@JsonValue(r'android')
android(r'android'),
    /// The kind of client signing in: `ios` or `android` for the customer app, `web` for the dashboards and the customer web.
@JsonValue(r'web')
web(r'web'),
    /// The kind of client signing in: `ios` or `android` for the customer app, `web` for the dashboards and the customer web.
@JsonValue(r'unknown_default_open_api')
unknownDefaultOpenApi(r'unknown_default_open_api');

const VerifyOtpDtoDevicePlatformEnum(this.value);

final String value;

@override
String toString() => value;
}



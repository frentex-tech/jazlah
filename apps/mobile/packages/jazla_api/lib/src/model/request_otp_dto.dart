//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:json_annotation/json_annotation.dart';

part 'request_otp_dto.g.dart';


@JsonSerializable(
  checked: true,
  createToJson: true,
  disallowUnrecognizedKeys: false,
  explicitToJson: true,
)
class RequestOtpDto {
  /// Returns a new [RequestOtpDto] instance.
  RequestOtpDto({

    required  this.phone,

    required  this.audience,
  });

      /// A Saudi mobile number, in any usual form (05…, 5…, 9665…, +9665…), with Latin or Arabic digits; the API stores it as +9665 and 8 digits. Anything else is VALIDATION_FAILED.
  @JsonKey(
    
    name: r'phone',
    required: true,
    includeIfNull: false,
  )


  final String phone;



      /// The app the user is signing in to: `customer` (customer app), `vendor`, `kitchen` or `admin` (the dashboards). The session and its tokens are for this audience only.
  @JsonKey(
    
    name: r'audience',
    required: true,
    includeIfNull: false,
  unknownEnumValue: RequestOtpDtoAudienceEnum.unknownDefaultOpenApi,
  )


  final RequestOtpDtoAudienceEnum audience;





    @override
    bool operator ==(Object other) => identical(this, other) || other is RequestOtpDto &&
      other.phone == phone &&
      other.audience == audience;

    @override
    int get hashCode =>
        phone.hashCode +
        audience.hashCode;

  factory RequestOtpDto.fromJson(Map<String, dynamic> json) => _$RequestOtpDtoFromJson(json);

  Map<String, dynamic> toJson() => _$RequestOtpDtoToJson(this);

  @override
  String toString() {
    return toJson().toString();
  }

}

/// The app the user is signing in to: `customer` (customer app), `vendor`, `kitchen` or `admin` (the dashboards). The session and its tokens are for this audience only.
enum RequestOtpDtoAudienceEnum {
    /// The app the user is signing in to: `customer` (customer app), `vendor`, `kitchen` or `admin` (the dashboards). The session and its tokens are for this audience only.
@JsonValue(r'customer')
customer(r'customer'),
    /// The app the user is signing in to: `customer` (customer app), `vendor`, `kitchen` or `admin` (the dashboards). The session and its tokens are for this audience only.
@JsonValue(r'vendor')
vendor(r'vendor'),
    /// The app the user is signing in to: `customer` (customer app), `vendor`, `kitchen` or `admin` (the dashboards). The session and its tokens are for this audience only.
@JsonValue(r'kitchen')
kitchen(r'kitchen'),
    /// The app the user is signing in to: `customer` (customer app), `vendor`, `kitchen` or `admin` (the dashboards). The session and its tokens are for this audience only.
@JsonValue(r'admin')
admin(r'admin'),
    /// The app the user is signing in to: `customer` (customer app), `vendor`, `kitchen` or `admin` (the dashboards). The session and its tokens are for this audience only.
@JsonValue(r'unknown_default_open_api')
unknownDefaultOpenApi(r'unknown_default_open_api');

const RequestOtpDtoAudienceEnum(this.value);

final String value;

@override
String toString() => value;
}



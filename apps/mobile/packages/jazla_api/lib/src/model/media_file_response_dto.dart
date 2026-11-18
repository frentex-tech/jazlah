//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:json_annotation/json_annotation.dart';

part 'media_file_response_dto.g.dart';


@JsonSerializable(
  checked: true,
  createToJson: true,
  disallowUnrecognizedKeys: false,
  explicitToJson: true,
)
class MediaFileResponseDto {
  /// Returns a new [MediaFileResponseDto] instance.
  MediaFileResponseDto({

    required  this.id,

    required  this.purpose,

    required  this.visibility,

    required  this.status,

    required  this.sizeBytes,

    required  this.contentType,

    required  this.originalFileName,

    required  this.confirmedAt,
  });

      /// The id of the file (UUID), the ticket `mediaId`. Give it to the endpoint that uses the file (a product `imageMediaIds`, the vendor `logoMediaId`, a vendor application `documents[].mediaId`); only the user who uploaded it can.
  @JsonKey(
    
    name: r'id',
    required: true,
    includeIfNull: false,
  )


  final String id;



      /// The upload purpose the ticket was requested for (`catalog.product-image`, `catalog.category-image`, `vendor.logo`, `vendor.cover`, `vendor.document`); only an endpoint expecting this purpose accepts the file.
  @JsonKey(
    
    name: r'purpose',
    required: true,
    includeIfNull: false,
  )


  final String purpose;



      /// Who can read the file, decided by the purpose. `public` (product images, logos): anyone, at a stable URL the endpoints that show the file return. `private` (vendor application documents): only through a short-lived link the API gives to those allowed.
  @JsonKey(
    
    name: r'visibility',
    required: true,
    includeIfNull: false,
  unknownEnumValue: MediaFileResponseDtoVisibilityEnum.unknownDefaultOpenApi,
  )


  final MediaFileResponseDtoVisibilityEnum visibility;



      /// Always `ready` here: the file passed the checks and can be used.
  @JsonKey(
    
    name: r'status',
    required: true,
    includeIfNull: false,
  unknownEnumValue: MediaFileResponseDtoStatusEnum.unknownDefaultOpenApi,
  )


  final MediaFileResponseDtoStatusEnum status;



      /// The size of the file in bytes, at least 1 and at most the limit of its purpose.
          // minimum: 1
  @JsonKey(
    
    name: r'sizeBytes',
    required: true,
    includeIfNull: false,
  )


  final int sizeBytes;



      /// The MIME type read from the file content itself; equal to the `contentType` declared for the ticket.
  @JsonKey(
    
    name: r'contentType',
    required: true,
    includeIfNull: false,
  )


  final String contentType;



      /// The file name sent with the ticket request, cleaned up for display (no folders, no control characters, at most 200 characters). Null when none was sent or nothing usable was left.
  @JsonKey(
    
    name: r'originalFileName',
    required: true,
    includeIfNull: true,
  )


  final String? originalFileName;



      /// When the file was confirmed (UTC, ISO 8601): the first successful confirmation.
  @JsonKey(
    
    name: r'confirmedAt',
    required: true,
    includeIfNull: false,
  )


  final DateTime confirmedAt;





    @override
    bool operator ==(Object other) => identical(this, other) || other is MediaFileResponseDto &&
      other.id == id &&
      other.purpose == purpose &&
      other.visibility == visibility &&
      other.status == status &&
      other.sizeBytes == sizeBytes &&
      other.contentType == contentType &&
      other.originalFileName == originalFileName &&
      other.confirmedAt == confirmedAt;

    @override
    int get hashCode =>
        id.hashCode +
        purpose.hashCode +
        visibility.hashCode +
        status.hashCode +
        sizeBytes.hashCode +
        contentType.hashCode +
        (originalFileName == null ? 0 : originalFileName.hashCode) +
        confirmedAt.hashCode;

  factory MediaFileResponseDto.fromJson(Map<String, dynamic> json) => _$MediaFileResponseDtoFromJson(json);

  Map<String, dynamic> toJson() => _$MediaFileResponseDtoToJson(this);

  @override
  String toString() {
    return toJson().toString();
  }

}

/// Who can read the file, decided by the purpose. `public` (product images, logos): anyone, at a stable URL the endpoints that show the file return. `private` (vendor application documents): only through a short-lived link the API gives to those allowed.
enum MediaFileResponseDtoVisibilityEnum {
    /// Who can read the file, decided by the purpose. `public` (product images, logos): anyone, at a stable URL the endpoints that show the file return. `private` (vendor application documents): only through a short-lived link the API gives to those allowed.
@JsonValue(r'public')
public(r'public'),
    /// Who can read the file, decided by the purpose. `public` (product images, logos): anyone, at a stable URL the endpoints that show the file return. `private` (vendor application documents): only through a short-lived link the API gives to those allowed.
@JsonValue(r'private')
private(r'private'),
    /// Who can read the file, decided by the purpose. `public` (product images, logos): anyone, at a stable URL the endpoints that show the file return. `private` (vendor application documents): only through a short-lived link the API gives to those allowed.
@JsonValue(r'unknown_default_open_api')
unknownDefaultOpenApi(r'unknown_default_open_api');

const MediaFileResponseDtoVisibilityEnum(this.value);

final String value;

@override
String toString() => value;
}


/// Always `ready` here: the file passed the checks and can be used.
enum MediaFileResponseDtoStatusEnum {
    /// Always `ready` here: the file passed the checks and can be used.
@JsonValue(r'ready')
ready(r'ready'),
    /// Always `ready` here: the file passed the checks and can be used.
@JsonValue(r'unknown_default_open_api')
unknownDefaultOpenApi(r'unknown_default_open_api');

const MediaFileResponseDtoStatusEnum(this.value);

final String value;

@override
String toString() => value;
}



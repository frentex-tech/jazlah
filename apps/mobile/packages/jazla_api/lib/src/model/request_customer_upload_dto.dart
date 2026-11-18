//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:json_annotation/json_annotation.dart';

part 'request_customer_upload_dto.g.dart';


@JsonSerializable(
  checked: true,
  createToJson: true,
  disallowUnrecognizedKeys: false,
  explicitToJson: true,
)
class RequestCustomerUploadDto {
  /// Returns a new [RequestCustomerUploadDto] instance.
  RequestCustomerUploadDto({

    required  this.contentType,

     this.fileName,

    required  this.purpose,
  });

      /// The MIME type of the file, one of the types its purpose accepts (see `purpose`; otherwise 415 MEDIA_CONTENT_TYPE_NOT_ALLOWED). The ticket pins it: the storage stores the file with this type, and confirmation rejects a file whose real content is another type. 1 to 100 characters.
  @JsonKey(
    
    name: r'contentType',
    required: true,
    includeIfNull: false,
  )


  final String contentType;



      /// The file name on the device, at most 255 characters. Optional. Kept for display only, cleaned up (no folders, no control characters, at most 200 characters) and returned as `originalFileName`; never used to name the stored file.
  @JsonKey(
    
    name: r'fileName',
    required: false,
    includeIfNull: false,
  )


  final String? fileName;



      /// Why the file is uploaded: decides the accepted types, the size limit and who can read the file. Accepted here:  - `vendor.document`: application/pdf, image/jpeg, image/png; 1 byte to 10 MiB (10485760 bytes); private (read only through a short-lived link from the API).
  @JsonKey(
    
    name: r'purpose',
    required: true,
    includeIfNull: false,
  unknownEnumValue: RequestCustomerUploadDtoPurposeEnum.unknownDefaultOpenApi,
  )


  final RequestCustomerUploadDtoPurposeEnum purpose;





    @override
    bool operator ==(Object other) => identical(this, other) || other is RequestCustomerUploadDto &&
      other.contentType == contentType &&
      other.fileName == fileName &&
      other.purpose == purpose;

    @override
    int get hashCode =>
        contentType.hashCode +
        fileName.hashCode +
        purpose.hashCode;

  factory RequestCustomerUploadDto.fromJson(Map<String, dynamic> json) => _$RequestCustomerUploadDtoFromJson(json);

  Map<String, dynamic> toJson() => _$RequestCustomerUploadDtoToJson(this);

  @override
  String toString() {
    return toJson().toString();
  }

}

/// Why the file is uploaded: decides the accepted types, the size limit and who can read the file. Accepted here:  - `vendor.document`: application/pdf, image/jpeg, image/png; 1 byte to 10 MiB (10485760 bytes); private (read only through a short-lived link from the API).
enum RequestCustomerUploadDtoPurposeEnum {
    /// Why the file is uploaded: decides the accepted types, the size limit and who can read the file. Accepted here:  - `vendor.document`: application/pdf, image/jpeg, image/png; 1 byte to 10 MiB (10485760 bytes); private (read only through a short-lived link from the API).
@JsonValue(r'vendor.document')
vendorPeriodDocument(r'vendor.document'),
    /// Why the file is uploaded: decides the accepted types, the size limit and who can read the file. Accepted here:  - `vendor.document`: application/pdf, image/jpeg, image/png; 1 byte to 10 MiB (10485760 bytes); private (read only through a short-lived link from the API).
@JsonValue(r'unknown_default_open_api')
unknownDefaultOpenApi(r'unknown_default_open_api');

const RequestCustomerUploadDtoPurposeEnum(this.value);

final String value;

@override
String toString() => value;
}



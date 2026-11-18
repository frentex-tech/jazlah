//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:json_annotation/json_annotation.dart';

part 'request_admin_upload_dto.g.dart';


@JsonSerializable(
  checked: true,
  createToJson: true,
  disallowUnrecognizedKeys: false,
  explicitToJson: true,
)
class RequestAdminUploadDto {
  /// Returns a new [RequestAdminUploadDto] instance.
  RequestAdminUploadDto({

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



      /// Why the file is uploaded: decides the accepted types, the size limit and who can read the file. Accepted here:  - `vendor.logo`: image/jpeg, image/png, image/webp; 1 byte to 2 MiB (2097152 bytes); public (anyone can read it at a stable URL). - `vendor.cover`: image/jpeg, image/png, image/webp; 1 byte to 2 MiB (2097152 bytes); public (anyone can read it at a stable URL). - `catalog.product-image`: image/jpeg, image/png, image/webp; 1 byte to 5 MiB (5242880 bytes); public (anyone can read it at a stable URL). - `catalog.category-image`: image/jpeg, image/png, image/webp; 1 byte to 2 MiB (2097152 bytes); public (anyone can read it at a stable URL).
  @JsonKey(
    
    name: r'purpose',
    required: true,
    includeIfNull: false,
  unknownEnumValue: RequestAdminUploadDtoPurposeEnum.unknownDefaultOpenApi,
  )


  final RequestAdminUploadDtoPurposeEnum purpose;





    @override
    bool operator ==(Object other) => identical(this, other) || other is RequestAdminUploadDto &&
      other.contentType == contentType &&
      other.fileName == fileName &&
      other.purpose == purpose;

    @override
    int get hashCode =>
        contentType.hashCode +
        fileName.hashCode +
        purpose.hashCode;

  factory RequestAdminUploadDto.fromJson(Map<String, dynamic> json) => _$RequestAdminUploadDtoFromJson(json);

  Map<String, dynamic> toJson() => _$RequestAdminUploadDtoToJson(this);

  @override
  String toString() {
    return toJson().toString();
  }

}

/// Why the file is uploaded: decides the accepted types, the size limit and who can read the file. Accepted here:  - `vendor.logo`: image/jpeg, image/png, image/webp; 1 byte to 2 MiB (2097152 bytes); public (anyone can read it at a stable URL). - `vendor.cover`: image/jpeg, image/png, image/webp; 1 byte to 2 MiB (2097152 bytes); public (anyone can read it at a stable URL). - `catalog.product-image`: image/jpeg, image/png, image/webp; 1 byte to 5 MiB (5242880 bytes); public (anyone can read it at a stable URL). - `catalog.category-image`: image/jpeg, image/png, image/webp; 1 byte to 2 MiB (2097152 bytes); public (anyone can read it at a stable URL).
enum RequestAdminUploadDtoPurposeEnum {
    /// Why the file is uploaded: decides the accepted types, the size limit and who can read the file. Accepted here:  - `vendor.logo`: image/jpeg, image/png, image/webp; 1 byte to 2 MiB (2097152 bytes); public (anyone can read it at a stable URL). - `vendor.cover`: image/jpeg, image/png, image/webp; 1 byte to 2 MiB (2097152 bytes); public (anyone can read it at a stable URL). - `catalog.product-image`: image/jpeg, image/png, image/webp; 1 byte to 5 MiB (5242880 bytes); public (anyone can read it at a stable URL). - `catalog.category-image`: image/jpeg, image/png, image/webp; 1 byte to 2 MiB (2097152 bytes); public (anyone can read it at a stable URL).
@JsonValue(r'vendor.logo')
vendorPeriodLogo(r'vendor.logo'),
    /// Why the file is uploaded: decides the accepted types, the size limit and who can read the file. Accepted here:  - `vendor.logo`: image/jpeg, image/png, image/webp; 1 byte to 2 MiB (2097152 bytes); public (anyone can read it at a stable URL). - `vendor.cover`: image/jpeg, image/png, image/webp; 1 byte to 2 MiB (2097152 bytes); public (anyone can read it at a stable URL). - `catalog.product-image`: image/jpeg, image/png, image/webp; 1 byte to 5 MiB (5242880 bytes); public (anyone can read it at a stable URL). - `catalog.category-image`: image/jpeg, image/png, image/webp; 1 byte to 2 MiB (2097152 bytes); public (anyone can read it at a stable URL).
@JsonValue(r'vendor.cover')
vendorPeriodCover(r'vendor.cover'),
    /// Why the file is uploaded: decides the accepted types, the size limit and who can read the file. Accepted here:  - `vendor.logo`: image/jpeg, image/png, image/webp; 1 byte to 2 MiB (2097152 bytes); public (anyone can read it at a stable URL). - `vendor.cover`: image/jpeg, image/png, image/webp; 1 byte to 2 MiB (2097152 bytes); public (anyone can read it at a stable URL). - `catalog.product-image`: image/jpeg, image/png, image/webp; 1 byte to 5 MiB (5242880 bytes); public (anyone can read it at a stable URL). - `catalog.category-image`: image/jpeg, image/png, image/webp; 1 byte to 2 MiB (2097152 bytes); public (anyone can read it at a stable URL).
@JsonValue(r'catalog.product-image')
catalogPeriodProductImage(r'catalog.product-image'),
    /// Why the file is uploaded: decides the accepted types, the size limit and who can read the file. Accepted here:  - `vendor.logo`: image/jpeg, image/png, image/webp; 1 byte to 2 MiB (2097152 bytes); public (anyone can read it at a stable URL). - `vendor.cover`: image/jpeg, image/png, image/webp; 1 byte to 2 MiB (2097152 bytes); public (anyone can read it at a stable URL). - `catalog.product-image`: image/jpeg, image/png, image/webp; 1 byte to 5 MiB (5242880 bytes); public (anyone can read it at a stable URL). - `catalog.category-image`: image/jpeg, image/png, image/webp; 1 byte to 2 MiB (2097152 bytes); public (anyone can read it at a stable URL).
@JsonValue(r'catalog.category-image')
catalogPeriodCategoryImage(r'catalog.category-image'),
    /// Why the file is uploaded: decides the accepted types, the size limit and who can read the file. Accepted here:  - `vendor.logo`: image/jpeg, image/png, image/webp; 1 byte to 2 MiB (2097152 bytes); public (anyone can read it at a stable URL). - `vendor.cover`: image/jpeg, image/png, image/webp; 1 byte to 2 MiB (2097152 bytes); public (anyone can read it at a stable URL). - `catalog.product-image`: image/jpeg, image/png, image/webp; 1 byte to 5 MiB (5242880 bytes); public (anyone can read it at a stable URL). - `catalog.category-image`: image/jpeg, image/png, image/webp; 1 byte to 2 MiB (2097152 bytes); public (anyone can read it at a stable URL).
@JsonValue(r'unknown_default_open_api')
unknownDefaultOpenApi(r'unknown_default_open_api');

const RequestAdminUploadDtoPurposeEnum(this.value);

final String value;

@override
String toString() => value;
}



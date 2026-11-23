//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:json_annotation/json_annotation.dart';

part 'vendor_application_document_link_response_dto.g.dart';


@JsonSerializable(
  checked: true,
  createToJson: true,
  disallowUnrecognizedKeys: false,
  explicitToJson: true,
)
class VendorApplicationDocumentLinkResponseDto {
  /// Returns a new [VendorApplicationDocumentLinkResponseDto] instance.
  VendorApplicationDocumentLinkResponseDto({

    required  this.kind,

    required  this.mediaId,

    required  this.url,

    required  this.expiresAt,
  });

      /// What the document shows: the commercial registration, the health certificate, a photo of the facility, the municipality licence or the national id.
  @JsonKey(
    
    name: r'kind',
    required: true,
    includeIfNull: false,
  unknownEnumValue: VendorApplicationDocumentLinkResponseDtoKindEnum.unknownDefaultOpenApi,
  )


  final VendorApplicationDocumentLinkResponseDtoKindEnum kind;



      /// The uploaded file (UUID, purpose vendor.document).
  @JsonKey(
    
    name: r'mediaId',
    required: true,
    includeIfNull: false,
  )


  final String mediaId;



      /// A presigned URL to open the file (the documents are private). It stops working at expiresAt: read the application again for a fresh one; never store it.
  @JsonKey(
    
    name: r'url',
    required: true,
    includeIfNull: false,
  )


  final String url;



      /// When the URL stops working, UTC ISO 8601 (a few minutes after the read); null if the file is public and its URL does not expire.
  @JsonKey(
    
    name: r'expiresAt',
    required: true,
    includeIfNull: true,
  )


  final DateTime? expiresAt;





    @override
    bool operator ==(Object other) => identical(this, other) || other is VendorApplicationDocumentLinkResponseDto &&
      other.kind == kind &&
      other.mediaId == mediaId &&
      other.url == url &&
      other.expiresAt == expiresAt;

    @override
    int get hashCode =>
        kind.hashCode +
        mediaId.hashCode +
        url.hashCode +
        (expiresAt == null ? 0 : expiresAt.hashCode);

  factory VendorApplicationDocumentLinkResponseDto.fromJson(Map<String, dynamic> json) => _$VendorApplicationDocumentLinkResponseDtoFromJson(json);

  Map<String, dynamic> toJson() => _$VendorApplicationDocumentLinkResponseDtoToJson(this);

  @override
  String toString() {
    return toJson().toString();
  }

}

/// What the document shows: the commercial registration, the health certificate, a photo of the facility, the municipality licence or the national id.
enum VendorApplicationDocumentLinkResponseDtoKindEnum {
    /// What the document shows: the commercial registration, the health certificate, a photo of the facility, the municipality licence or the national id.
@JsonValue(r'commercial_registration')
commercialRegistration(r'commercial_registration'),
    /// What the document shows: the commercial registration, the health certificate, a photo of the facility, the municipality licence or the national id.
@JsonValue(r'health_certificate')
healthCertificate(r'health_certificate'),
    /// What the document shows: the commercial registration, the health certificate, a photo of the facility, the municipality licence or the national id.
@JsonValue(r'facility_photo')
facilityPhoto(r'facility_photo'),
    /// What the document shows: the commercial registration, the health certificate, a photo of the facility, the municipality licence or the national id.
@JsonValue(r'municipality_licence')
municipalityLicence(r'municipality_licence'),
    /// What the document shows: the commercial registration, the health certificate, a photo of the facility, the municipality licence or the national id.
@JsonValue(r'national_id')
nationalId(r'national_id'),
    /// What the document shows: the commercial registration, the health certificate, a photo of the facility, the municipality licence or the national id.
@JsonValue(r'unknown_default_open_api')
unknownDefaultOpenApi(r'unknown_default_open_api');

const VendorApplicationDocumentLinkResponseDtoKindEnum(this.value);

final String value;

@override
String toString() => value;
}



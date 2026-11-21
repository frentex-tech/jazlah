//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:json_annotation/json_annotation.dart';

part 'vendor_application_document_response_dto.g.dart';


@JsonSerializable(
  checked: true,
  createToJson: true,
  disallowUnrecognizedKeys: false,
  explicitToJson: true,
)
class VendorApplicationDocumentResponseDto {
  /// Returns a new [VendorApplicationDocumentResponseDto] instance.
  VendorApplicationDocumentResponseDto({

    required  this.kind,

    required  this.mediaId,
  });

      /// What the document shows: the commercial registration, the health certificate, a photo of the facility, the municipality licence or the national id.
  @JsonKey(
    
    name: r'kind',
    required: true,
    includeIfNull: false,
  unknownEnumValue: VendorApplicationDocumentResponseDtoKindEnum.unknownDefaultOpenApi,
  )


  final VendorApplicationDocumentResponseDtoKindEnum kind;



      /// The uploaded file (UUID, purpose vendor.document).
  @JsonKey(
    
    name: r'mediaId',
    required: true,
    includeIfNull: false,
  )


  final String mediaId;





    @override
    bool operator ==(Object other) => identical(this, other) || other is VendorApplicationDocumentResponseDto &&
      other.kind == kind &&
      other.mediaId == mediaId;

    @override
    int get hashCode =>
        kind.hashCode +
        mediaId.hashCode;

  factory VendorApplicationDocumentResponseDto.fromJson(Map<String, dynamic> json) => _$VendorApplicationDocumentResponseDtoFromJson(json);

  Map<String, dynamic> toJson() => _$VendorApplicationDocumentResponseDtoToJson(this);

  @override
  String toString() {
    return toJson().toString();
  }

}

/// What the document shows: the commercial registration, the health certificate, a photo of the facility, the municipality licence or the national id.
enum VendorApplicationDocumentResponseDtoKindEnum {
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

const VendorApplicationDocumentResponseDtoKindEnum(this.value);

final String value;

@override
String toString() => value;
}



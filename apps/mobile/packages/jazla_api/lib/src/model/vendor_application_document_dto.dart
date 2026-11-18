//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:json_annotation/json_annotation.dart';

part 'vendor_application_document_dto.g.dart';


@JsonSerializable(
  checked: true,
  createToJson: true,
  disallowUnrecognizedKeys: false,
  explicitToJson: true,
)
class VendorApplicationDocumentDto {
  /// Returns a new [VendorApplicationDocumentDto] instance.
  VendorApplicationDocumentDto({

    required  this.kind,

    required  this.mediaId,
  });

      /// What the document shows: commercial_registration, health_certificate, facility_photo, municipality_licence (optional) or national_id (optional).
  @JsonKey(
    
    name: r'kind',
    required: true,
    includeIfNull: false,
  unknownEnumValue: VendorApplicationDocumentDtoKindEnum.unknownDefaultOpenApi,
  )


  final VendorApplicationDocumentDtoKindEnum kind;



      /// The id (UUID) of a file the signed-in customer uploaded with purpose vendor.document and confirmed (PDF, JPEG or PNG, up to 10 MB).
  @JsonKey(
    
    name: r'mediaId',
    required: true,
    includeIfNull: false,
  )


  final String mediaId;





    @override
    bool operator ==(Object other) => identical(this, other) || other is VendorApplicationDocumentDto &&
      other.kind == kind &&
      other.mediaId == mediaId;

    @override
    int get hashCode =>
        kind.hashCode +
        mediaId.hashCode;

  factory VendorApplicationDocumentDto.fromJson(Map<String, dynamic> json) => _$VendorApplicationDocumentDtoFromJson(json);

  Map<String, dynamic> toJson() => _$VendorApplicationDocumentDtoToJson(this);

  @override
  String toString() {
    return toJson().toString();
  }

}

/// What the document shows: commercial_registration, health_certificate, facility_photo, municipality_licence (optional) or national_id (optional).
enum VendorApplicationDocumentDtoKindEnum {
    /// What the document shows: commercial_registration, health_certificate, facility_photo, municipality_licence (optional) or national_id (optional).
@JsonValue(r'commercial_registration')
commercialRegistration(r'commercial_registration'),
    /// What the document shows: commercial_registration, health_certificate, facility_photo, municipality_licence (optional) or national_id (optional).
@JsonValue(r'health_certificate')
healthCertificate(r'health_certificate'),
    /// What the document shows: commercial_registration, health_certificate, facility_photo, municipality_licence (optional) or national_id (optional).
@JsonValue(r'facility_photo')
facilityPhoto(r'facility_photo'),
    /// What the document shows: commercial_registration, health_certificate, facility_photo, municipality_licence (optional) or national_id (optional).
@JsonValue(r'municipality_licence')
municipalityLicence(r'municipality_licence'),
    /// What the document shows: commercial_registration, health_certificate, facility_photo, municipality_licence (optional) or national_id (optional).
@JsonValue(r'national_id')
nationalId(r'national_id'),
    /// What the document shows: commercial_registration, health_certificate, facility_photo, municipality_licence (optional) or national_id (optional).
@JsonValue(r'unknown_default_open_api')
unknownDefaultOpenApi(r'unknown_default_open_api');

const VendorApplicationDocumentDtoKindEnum(this.value);

final String value;

@override
String toString() => value;
}



//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:jazla_api/src/model/geo_point_dto.dart';
import 'package:jazla_api/src/model/localized_text_response_dto.dart';
import 'package:jazla_api/src/model/optional_localized_text_response_dto.dart';
import 'package:jazla_api/src/model/vendor_application_document_link_response_dto.dart';
import 'package:json_annotation/json_annotation.dart';

part 'vendor_application_detail_response_dto.g.dart';


@JsonSerializable(
  checked: true,
  createToJson: true,
  disallowUnrecognizedKeys: false,
  explicitToJson: true,
)
class VendorApplicationDetailResponseDto {
  /// Returns a new [VendorApplicationDetailResponseDto] instance.
  VendorApplicationDetailResponseDto({

    required  this.id,

    required  this.applicantId,

    required  this.status,

    required  this.name,

    required  this.description,

    required  this.commercialRegistrationNumber,

    required  this.vatNumber,

    required  this.city,

    required  this.ibanMasked,

    required  this.accountHolderName,

    required  this.location,

    required  this.rejectionReason,

    required  this.reviewedAt,

    required  this.createdAt,

    required  this.documents,

    required  this.reviewedById,
  });

      /// The application id, a UUID.
  @JsonKey(
    
    name: r'id',
    required: true,
    includeIfNull: false,
  )


  final String id;



      /// The user (UUID) who applied.
  @JsonKey(
    
    name: r'applicantId',
    required: true,
    includeIfNull: false,
  )


  final String applicantId;



      /// pending: waiting for an admin. approved: the vendor exists and the applicant can sign in to the vendor dashboard. rejected: see rejectionReason; the applicant may apply again. An application is reviewed once and never changes after.
  @JsonKey(
    
    name: r'status',
    required: true,
    includeIfNull: false,
  unknownEnumValue: VendorApplicationDetailResponseDtoStatusEnum.unknownDefaultOpenApi,
  )


  final VendorApplicationDetailResponseDtoStatusEnum status;



      /// The store name in Arabic and English.
  @JsonKey(
    
    name: r'name',
    required: true,
    includeIfNull: false,
  )


  final LocalizedTextResponseDto name;



      /// The store description in Arabic and English; either language is null when not written.
  @JsonKey(
    
    name: r'description',
    required: true,
    includeIfNull: false,
  )


  final OptionalLocalizedTextResponseDto description;



      /// The commercial registration number, 10 Latin digits.
  @JsonKey(
    
    name: r'commercialRegistrationNumber',
    required: true,
    includeIfNull: false,
  )


  final String commercialRegistrationNumber;



      /// The VAT registration number, 15 Latin digits starting and ending with 3; null when the applicant gave none.
  @JsonKey(
    
    name: r'vatNumber',
    required: true,
    includeIfNull: true,
  )


  final String? vatNumber;



      /// The city the store is in, as the applicant wrote it; null only for applications submitted before the city was asked.
  @JsonKey(
    
    name: r'city',
    required: true,
    includeIfNull: true,
  )


  final String? city;



      /// The payout IBAN with every character hidden but the country and the last four; the full IBAN is never sent.
  @JsonKey(
    
    name: r'ibanMasked',
    required: true,
    includeIfNull: false,
  )


  final String ibanMasked;



      /// The name on the payout bank account.
  @JsonKey(
    
    name: r'accountHolderName',
    required: true,
    includeIfNull: false,
  )


  final String accountHolderName;



      /// Where the facility is.
  @JsonKey(
    
    name: r'location',
    required: true,
    includeIfNull: false,
  )


  final GeoPointDto location;



      /// The admin’s reason, written for the applicant to read (1 to 500 characters); null unless rejected.
  @JsonKey(
    
    name: r'rejectionReason',
    required: true,
    includeIfNull: true,
  )


  final String? rejectionReason;



      /// When an admin approved or rejected it, UTC ISO 8601; null while pending.
  @JsonKey(
    
    name: r'reviewedAt',
    required: true,
    includeIfNull: true,
  )


  final DateTime? reviewedAt;



      /// When it was submitted, UTC ISO 8601.
  @JsonKey(
    
    name: r'createdAt',
    required: true,
    includeIfNull: false,
  )


  final DateTime createdAt;



      /// The attached documents, each with a short-lived link to open it.
  @JsonKey(
    
    name: r'documents',
    required: true,
    includeIfNull: false,
  )


  final List<VendorApplicationDocumentLinkResponseDto> documents;



      /// The admin (user UUID) who approved or rejected it; null while pending.
  @JsonKey(
    
    name: r'reviewedById',
    required: true,
    includeIfNull: true,
  )


  final String? reviewedById;





    @override
    bool operator ==(Object other) => identical(this, other) || other is VendorApplicationDetailResponseDto &&
      other.id == id &&
      other.applicantId == applicantId &&
      other.status == status &&
      other.name == name &&
      other.description == description &&
      other.commercialRegistrationNumber == commercialRegistrationNumber &&
      other.vatNumber == vatNumber &&
      other.city == city &&
      other.ibanMasked == ibanMasked &&
      other.accountHolderName == accountHolderName &&
      other.location == location &&
      other.rejectionReason == rejectionReason &&
      other.reviewedAt == reviewedAt &&
      other.createdAt == createdAt &&
      other.documents == documents &&
      other.reviewedById == reviewedById;

    @override
    int get hashCode =>
        id.hashCode +
        applicantId.hashCode +
        status.hashCode +
        name.hashCode +
        description.hashCode +
        commercialRegistrationNumber.hashCode +
        (vatNumber == null ? 0 : vatNumber.hashCode) +
        (city == null ? 0 : city.hashCode) +
        ibanMasked.hashCode +
        accountHolderName.hashCode +
        location.hashCode +
        (rejectionReason == null ? 0 : rejectionReason.hashCode) +
        (reviewedAt == null ? 0 : reviewedAt.hashCode) +
        createdAt.hashCode +
        documents.hashCode +
        (reviewedById == null ? 0 : reviewedById.hashCode);

  factory VendorApplicationDetailResponseDto.fromJson(Map<String, dynamic> json) => _$VendorApplicationDetailResponseDtoFromJson(json);

  Map<String, dynamic> toJson() => _$VendorApplicationDetailResponseDtoToJson(this);

  @override
  String toString() {
    return toJson().toString();
  }

}

/// pending: waiting for an admin. approved: the vendor exists and the applicant can sign in to the vendor dashboard. rejected: see rejectionReason; the applicant may apply again. An application is reviewed once and never changes after.
enum VendorApplicationDetailResponseDtoStatusEnum {
    /// pending: waiting for an admin. approved: the vendor exists and the applicant can sign in to the vendor dashboard. rejected: see rejectionReason; the applicant may apply again. An application is reviewed once and never changes after.
@JsonValue(r'pending')
pending(r'pending'),
    /// pending: waiting for an admin. approved: the vendor exists and the applicant can sign in to the vendor dashboard. rejected: see rejectionReason; the applicant may apply again. An application is reviewed once and never changes after.
@JsonValue(r'approved')
approved(r'approved'),
    /// pending: waiting for an admin. approved: the vendor exists and the applicant can sign in to the vendor dashboard. rejected: see rejectionReason; the applicant may apply again. An application is reviewed once and never changes after.
@JsonValue(r'rejected')
rejected(r'rejected'),
    /// pending: waiting for an admin. approved: the vendor exists and the applicant can sign in to the vendor dashboard. rejected: see rejectionReason; the applicant may apply again. An application is reviewed once and never changes after.
@JsonValue(r'unknown_default_open_api')
unknownDefaultOpenApi(r'unknown_default_open_api');

const VendorApplicationDetailResponseDtoStatusEnum(this.value);

final String value;

@override
String toString() => value;
}



//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:jazla_api/src/model/geo_point_dto.dart';
import 'package:jazla_api/src/model/localized_text_response_dto.dart';
import 'package:jazla_api/src/model/optional_localized_text_response_dto.dart';
import 'package:json_annotation/json_annotation.dart';

part 'admin_vendor_response_dto.g.dart';


@JsonSerializable(
  checked: true,
  createToJson: true,
  disallowUnrecognizedKeys: false,
  explicitToJson: true,
)
class AdminVendorResponseDto {
  /// Returns a new [AdminVendorResponseDto] instance.
  AdminVendorResponseDto({

    required  this.id,

    required  this.name,

    required  this.description,

    required  this.logoUrl,

    required  this.coverUrl,

    required  this.city,

    required  this.commissionBasisPoints,

    required  this.commercialRegistrationNumber,

    required  this.vatNumber,

    required  this.contactPhone,

    required  this.contactEmail,

    required  this.ibanMasked,

    required  this.accountHolderName,

    required  this.location,

    required  this.createdAt,

    required  this.isPlatform,

    required  this.status,

    required  this.suspendedAt,

    required  this.suspensionReason,

    required  this.applicationId,
  });

      /// The vendor (store) id, a UUID.
  @JsonKey(
    
    name: r'id',
    required: true,
    includeIfNull: false,
  )


  final String id;



      /// The store name in Arabic and English, as approved from its application.
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



      /// The logo’s stable public URL, to show as is (it does not expire); null when the vendor has no logo.
  @JsonKey(
    
    name: r'logoUrl',
    required: true,
    includeIfNull: true,
  )


  final String? logoUrl;



      /// The cover photo’s stable public URL (the wide image at the top of the store page), to show as is; null when the vendor has none.
  @JsonKey(
    
    name: r'coverUrl',
    required: true,
    includeIfNull: true,
  )


  final String? coverUrl;



      /// The city the store is in, as written (usually Arabic); null for stores approved before the city was asked and for the platform vendor.
  @JsonKey(
    
    name: r'city',
    required: true,
    includeIfNull: true,
  )


  final String? city;



      /// The platform commission on future orders, in basis points (an integer, 0 to 10000): 1250 is 12.5%. Orders already placed keep the commission they were placed with.
          // minimum: 0
          // maximum: 10000
  @JsonKey(
    
    name: r'commissionBasisPoints',
    required: true,
    includeIfNull: false,
  )


  final num commissionBasisPoints;



      /// The commercial registration number, 10 Latin digits; null only for the platform vendor.
  @JsonKey(
    
    name: r'commercialRegistrationNumber',
    required: true,
    includeIfNull: true,
  )


  final String? commercialRegistrationNumber;



      /// The VAT registration number, 15 Latin digits starting and ending with 3; null when none was given. Not public.
  @JsonKey(
    
    name: r'vatNumber',
    required: true,
    includeIfNull: true,
  )


  final String? vatNumber;



      /// The store’s contact number for the platform, in E.164 (a Saudi mobile +9665… or landline +9661…); null until set. Not public.
  @JsonKey(
    
    name: r'contactPhone',
    required: true,
    includeIfNull: true,
  )


  final String? contactPhone;



      /// The store’s contact email for the platform, lowercase and not verified; null until set. Not public.
  @JsonKey(
    
    name: r'contactEmail',
    required: true,
    includeIfNull: true,
  )


  final String? contactEmail;



      /// The payout IBAN with every character hidden but the country and the last four (the full IBAN is never sent); null only for the platform vendor.
  @JsonKey(
    
    name: r'ibanMasked',
    required: true,
    includeIfNull: true,
  )


  final String? ibanMasked;



      /// The name on the payout bank account; null only for the platform vendor.
  @JsonKey(
    
    name: r'accountHolderName',
    required: true,
    includeIfNull: true,
  )


  final String? accountHolderName;



      /// Where the facility is, from the application; null only for the platform vendor.
  @JsonKey(
    
    name: r'location',
    required: true,
    includeIfNull: true,
  )


  final GeoPointDto? location;



      /// When the vendor was created (its application approved), UTC ISO 8601.
  @JsonKey(
    
    name: r'createdAt',
    required: true,
    includeIfNull: false,
  )


  final DateTime createdAt;



      /// Whether this is the platform’s own vendor (JAZLA’s products). It has no owner, application or business and bank details; admins manage its profile and products.
  @JsonKey(
    
    name: r'isPlatform',
    required: true,
    includeIfNull: false,
  )


  final bool isPlatform;



      /// active: trades and is listed publicly. suspended: hidden from customers, and its users are refused on vendor routes, at sign-in and on refresh (VENDOR_SUSPENDED) until an admin reinstates it.
  @JsonKey(
    
    name: r'status',
    required: true,
    includeIfNull: false,
  unknownEnumValue: AdminVendorResponseDtoStatusEnum.unknownDefaultOpenApi,
  )


  final AdminVendorResponseDtoStatusEnum status;



      /// When it was suspended, UTC ISO 8601; null while active. Example of a suspended vendor: 2026-11-15T10:00:00.000Z.
  @JsonKey(
    
    name: r'suspendedAt',
    required: true,
    includeIfNull: true,
  )


  final DateTime? suspendedAt;



      /// The admin’s reason for the suspension, 1 to 500 characters, shown to admins only; null while active.
  @JsonKey(
    
    name: r'suspensionReason',
    required: true,
    includeIfNull: true,
  )


  final String? suspensionReason;



      /// The id (UUID) of the approved application the vendor came from; null only for the platform vendor.
  @JsonKey(
    
    name: r'applicationId',
    required: true,
    includeIfNull: true,
  )


  final String? applicationId;





    @override
    bool operator ==(Object other) => identical(this, other) || other is AdminVendorResponseDto &&
      other.id == id &&
      other.name == name &&
      other.description == description &&
      other.logoUrl == logoUrl &&
      other.coverUrl == coverUrl &&
      other.city == city &&
      other.commissionBasisPoints == commissionBasisPoints &&
      other.commercialRegistrationNumber == commercialRegistrationNumber &&
      other.vatNumber == vatNumber &&
      other.contactPhone == contactPhone &&
      other.contactEmail == contactEmail &&
      other.ibanMasked == ibanMasked &&
      other.accountHolderName == accountHolderName &&
      other.location == location &&
      other.createdAt == createdAt &&
      other.isPlatform == isPlatform &&
      other.status == status &&
      other.suspendedAt == suspendedAt &&
      other.suspensionReason == suspensionReason &&
      other.applicationId == applicationId;

    @override
    int get hashCode =>
        id.hashCode +
        name.hashCode +
        description.hashCode +
        (logoUrl == null ? 0 : logoUrl.hashCode) +
        (coverUrl == null ? 0 : coverUrl.hashCode) +
        (city == null ? 0 : city.hashCode) +
        commissionBasisPoints.hashCode +
        (commercialRegistrationNumber == null ? 0 : commercialRegistrationNumber.hashCode) +
        (vatNumber == null ? 0 : vatNumber.hashCode) +
        (contactPhone == null ? 0 : contactPhone.hashCode) +
        (contactEmail == null ? 0 : contactEmail.hashCode) +
        (ibanMasked == null ? 0 : ibanMasked.hashCode) +
        (accountHolderName == null ? 0 : accountHolderName.hashCode) +
        (location == null ? 0 : location.hashCode) +
        createdAt.hashCode +
        isPlatform.hashCode +
        status.hashCode +
        (suspendedAt == null ? 0 : suspendedAt.hashCode) +
        (suspensionReason == null ? 0 : suspensionReason.hashCode) +
        (applicationId == null ? 0 : applicationId.hashCode);

  factory AdminVendorResponseDto.fromJson(Map<String, dynamic> json) => _$AdminVendorResponseDtoFromJson(json);

  Map<String, dynamic> toJson() => _$AdminVendorResponseDtoToJson(this);

  @override
  String toString() {
    return toJson().toString();
  }

}

/// active: trades and is listed publicly. suspended: hidden from customers, and its users are refused on vendor routes, at sign-in and on refresh (VENDOR_SUSPENDED) until an admin reinstates it.
enum AdminVendorResponseDtoStatusEnum {
    /// active: trades and is listed publicly. suspended: hidden from customers, and its users are refused on vendor routes, at sign-in and on refresh (VENDOR_SUSPENDED) until an admin reinstates it.
@JsonValue(r'active')
active(r'active'),
    /// active: trades and is listed publicly. suspended: hidden from customers, and its users are refused on vendor routes, at sign-in and on refresh (VENDOR_SUSPENDED) until an admin reinstates it.
@JsonValue(r'suspended')
suspended(r'suspended'),
    /// active: trades and is listed publicly. suspended: hidden from customers, and its users are refused on vendor routes, at sign-in and on refresh (VENDOR_SUSPENDED) until an admin reinstates it.
@JsonValue(r'unknown_default_open_api')
unknownDefaultOpenApi(r'unknown_default_open_api');

const AdminVendorResponseDtoStatusEnum(this.value);

final String value;

@override
String toString() => value;
}



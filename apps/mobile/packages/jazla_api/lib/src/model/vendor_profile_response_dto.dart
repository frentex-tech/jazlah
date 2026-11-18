//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:jazla_api/src/model/geo_point_dto.dart';
import 'package:jazla_api/src/model/localized_text_response_dto.dart';
import 'package:jazla_api/src/model/optional_localized_text_response_dto.dart';
import 'package:json_annotation/json_annotation.dart';

part 'vendor_profile_response_dto.g.dart';


@JsonSerializable(
  checked: true,
  createToJson: true,
  disallowUnrecognizedKeys: false,
  explicitToJson: true,
)
class VendorProfileResponseDto {
  /// Returns a new [VendorProfileResponseDto] instance.
  VendorProfileResponseDto({

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





    @override
    bool operator ==(Object other) => identical(this, other) || other is VendorProfileResponseDto &&
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
      other.createdAt == createdAt;

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
        createdAt.hashCode;

  factory VendorProfileResponseDto.fromJson(Map<String, dynamic> json) => _$VendorProfileResponseDtoFromJson(json);

  Map<String, dynamic> toJson() => _$VendorProfileResponseDtoToJson(this);

  @override
  String toString() {
    return toJson().toString();
  }

}


//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:jazla_api/src/model/localized_description_dto.dart';
import 'package:json_annotation/json_annotation.dart';

part 'update_vendor_profile_dto.g.dart';


@JsonSerializable(
  checked: true,
  createToJson: true,
  disallowUnrecognizedKeys: false,
  explicitToJson: true,
)
class UpdateVendorProfileDto {
  /// Returns a new [UpdateVendorProfileDto] instance.
  UpdateVendorProfileDto({

     this.logoMediaId,

     this.coverMediaId,

     this.contactPhone,

     this.contactEmail,

     this.vatNumber,

     this.description,
  });

      /// The id (UUID) of a file the signed-in user uploaded with purpose vendor.logo and confirmed (JPEG, PNG or WebP, up to 2 MB); null removes the logo; omit it to keep the current one.
  @JsonKey(
    
    name: r'logoMediaId',
    required: false,
    includeIfNull: false,
  )


  final String? logoMediaId;



      /// The id (UUID) of a file the signed-in user uploaded with purpose vendor.cover and confirmed (JPEG, PNG or WebP, up to 2 MB): the wide photo at the top of the store page. null removes it; omit it to keep the current one.
  @JsonKey(
    
    name: r'coverMediaId',
    required: false,
    includeIfNull: false,
  )


  final String? coverMediaId;



      /// The store’s contact number for the platform (not shown to customers): a Saudi mobile or landline (area code 011 to 017), in any usual form (05…, 011…, +966…, Arabic digits, spaces). Stored and returned in E.164 (+966…). null removes it; omit it to keep the current one. VALIDATION_FAILED with isSaudiPhoneNumber otherwise.
  @JsonKey(
    
    name: r'contactPhone',
    required: false,
    includeIfNull: false,
  )


  final String? contactPhone;



      /// The store’s contact email for the platform (not shown to customers), up to 254 characters; stored lowercase and not verified. null or blank removes it; omit it to keep the current one.
  @JsonKey(
    
    name: r'contactEmail',
    required: false,
    includeIfNull: false,
  )


  final String? contactEmail;



      /// The VAT registration number: 15 digits starting and ending with 3, Latin or Arabic. null removes it; omit it to keep the current one.
  @JsonKey(
    
    name: r'vatNumber',
    required: false,
    includeIfNull: false,
  )


  final String? vatNumber;



      /// The store description: an object, never null. Inside it a language left out stays as it is, and null or a blank text clears it. Omit the whole field to keep both.
  @JsonKey(
    
    name: r'description',
    required: false,
    includeIfNull: false,
  )


  final LocalizedDescriptionDto? description;





    @override
    bool operator ==(Object other) => identical(this, other) || other is UpdateVendorProfileDto &&
      other.logoMediaId == logoMediaId &&
      other.coverMediaId == coverMediaId &&
      other.contactPhone == contactPhone &&
      other.contactEmail == contactEmail &&
      other.vatNumber == vatNumber &&
      other.description == description;

    @override
    int get hashCode =>
        (logoMediaId == null ? 0 : logoMediaId.hashCode) +
        (coverMediaId == null ? 0 : coverMediaId.hashCode) +
        (contactPhone == null ? 0 : contactPhone.hashCode) +
        (contactEmail == null ? 0 : contactEmail.hashCode) +
        (vatNumber == null ? 0 : vatNumber.hashCode) +
        description.hashCode;

  factory UpdateVendorProfileDto.fromJson(Map<String, dynamic> json) => _$UpdateVendorProfileDtoFromJson(json);

  Map<String, dynamic> toJson() => _$UpdateVendorProfileDtoToJson(this);

  @override
  String toString() {
    return toJson().toString();
  }

}


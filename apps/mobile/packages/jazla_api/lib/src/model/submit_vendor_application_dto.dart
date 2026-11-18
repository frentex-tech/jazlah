//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:jazla_api/src/model/localized_name_dto.dart';
import 'package:jazla_api/src/model/geo_point_dto.dart';
import 'package:jazla_api/src/model/vendor_application_document_dto.dart';
import 'package:jazla_api/src/model/localized_description_dto.dart';
import 'package:json_annotation/json_annotation.dart';

part 'submit_vendor_application_dto.g.dart';


@JsonSerializable(
  checked: true,
  createToJson: true,
  disallowUnrecognizedKeys: false,
  explicitToJson: true,
)
class SubmitVendorApplicationDto {
  /// Returns a new [SubmitVendorApplicationDto] instance.
  SubmitVendorApplicationDto({

    required  this.name,

     this.description,

    required  this.commercialRegistrationNumber,

     this.vatNumber,

    required  this.city,

    required  this.iban,

    required  this.accountHolderName,

    required  this.location,

    required  this.documents,
  });

      /// The store name customers will see, in Arabic and English (both required).
  @JsonKey(
    
    name: r'name',
    required: true,
    includeIfNull: false,
  )


  final LocalizedNameDto name;



      /// An optional store description in Arabic and English; omit it, or either language, when there is none.
  @JsonKey(
    
    name: r'description',
    required: false,
    includeIfNull: false,
  )


  final LocalizedDescriptionDto? description;



      /// The commercial registration number: 10 digits, Latin or Arabic.
  @JsonKey(
    
    name: r'commercialRegistrationNumber',
    required: true,
    includeIfNull: false,
  )


  final String commercialRegistrationNumber;



      /// The VAT registration number, optional: 15 digits starting and ending with 3, Latin or Arabic. Omit it when the business is not registered for VAT.
  @JsonKey(
    
    name: r'vatNumber',
    required: false,
    includeIfNull: false,
  )


  final String? vatNumber;



      /// The city the store is in, as written (Arabic expected): 2 to 50 characters after invisible format characters are removed and spaces trimmed. Shown on the public store page.
  @JsonKey(
    
    name: r'city',
    required: true,
    includeIfNull: false,
  )


  final String city;



      /// The Saudi IBAN of the account payouts go to (SA and 22 more characters; spaces allowed). Never returned: responses show it masked.
  @JsonKey(
    
    name: r'iban',
    required: true,
    includeIfNull: false,
  )


  final String iban;



      /// The name on the payout bank account, 2 to 100 characters; trimmed.
  @JsonKey(
    
    name: r'accountHolderName',
    required: true,
    includeIfNull: false,
  )


  final String accountHolderName;



      /// Where the facility (shop or slaughterhouse) is.
  @JsonKey(
    
    name: r'location',
    required: true,
    includeIfNull: false,
  )


  final GeoPointDto location;



      /// At least one document of each required kind (commercial_registration, health_certificate, facility_photo); the other kinds (municipality_licence, national_id) are optional. Each file once, at most 10 in all.
  @JsonKey(
    
    name: r'documents',
    required: true,
    includeIfNull: false,
  )


  final List<VendorApplicationDocumentDto> documents;





    @override
    bool operator ==(Object other) => identical(this, other) || other is SubmitVendorApplicationDto &&
      other.name == name &&
      other.description == description &&
      other.commercialRegistrationNumber == commercialRegistrationNumber &&
      other.vatNumber == vatNumber &&
      other.city == city &&
      other.iban == iban &&
      other.accountHolderName == accountHolderName &&
      other.location == location &&
      other.documents == documents;

    @override
    int get hashCode =>
        name.hashCode +
        description.hashCode +
        commercialRegistrationNumber.hashCode +
        vatNumber.hashCode +
        city.hashCode +
        iban.hashCode +
        accountHolderName.hashCode +
        location.hashCode +
        documents.hashCode;

  factory SubmitVendorApplicationDto.fromJson(Map<String, dynamic> json) => _$SubmitVendorApplicationDtoFromJson(json);

  Map<String, dynamic> toJson() => _$SubmitVendorApplicationDtoToJson(this);

  @override
  String toString() {
    return toJson().toString();
  }

}


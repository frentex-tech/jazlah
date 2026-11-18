//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:jazla_api/src/model/localized_text_response_dto.dart';
import 'package:jazla_api/src/model/optional_localized_text_response_dto.dart';
import 'package:json_annotation/json_annotation.dart';

part 'public_vendor_response_dto.g.dart';


@JsonSerializable(
  checked: true,
  createToJson: true,
  disallowUnrecognizedKeys: false,
  explicitToJson: true,
)
class PublicVendorResponseDto {
  /// Returns a new [PublicVendorResponseDto] instance.
  PublicVendorResponseDto({

    required  this.id,

    required  this.name,

    required  this.description,

    required  this.logoUrl,

    required  this.coverUrl,

    required  this.city,
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





    @override
    bool operator ==(Object other) => identical(this, other) || other is PublicVendorResponseDto &&
      other.id == id &&
      other.name == name &&
      other.description == description &&
      other.logoUrl == logoUrl &&
      other.coverUrl == coverUrl &&
      other.city == city;

    @override
    int get hashCode =>
        id.hashCode +
        name.hashCode +
        description.hashCode +
        (logoUrl == null ? 0 : logoUrl.hashCode) +
        (coverUrl == null ? 0 : coverUrl.hashCode) +
        (city == null ? 0 : city.hashCode);

  factory PublicVendorResponseDto.fromJson(Map<String, dynamic> json) => _$PublicVendorResponseDtoFromJson(json);

  Map<String, dynamic> toJson() => _$PublicVendorResponseDtoToJson(this);

  @override
  String toString() {
    return toJson().toString();
  }

}


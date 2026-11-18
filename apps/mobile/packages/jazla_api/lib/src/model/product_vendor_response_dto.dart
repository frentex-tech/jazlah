//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:jazla_api/src/model/localized_text_response_dto.dart';
import 'package:json_annotation/json_annotation.dart';

part 'product_vendor_response_dto.g.dart';


@JsonSerializable(
  checked: true,
  createToJson: true,
  disallowUnrecognizedKeys: false,
  explicitToJson: true,
)
class ProductVendorResponseDto {
  /// Returns a new [ProductVendorResponseDto] instance.
  ProductVendorResponseDto({

    required  this.id,

    required  this.name,
  });

      /// The vendor’s id (UUID).
  @JsonKey(
    
    name: r'id',
    required: true,
    includeIfNull: false,
  )


  final String id;



      /// The vendor’s store name in Arabic and English; null only if the vendor cannot be read.
  @JsonKey(
    
    name: r'name',
    required: true,
    includeIfNull: true,
  )


  final LocalizedTextResponseDto? name;





    @override
    bool operator ==(Object other) => identical(this, other) || other is ProductVendorResponseDto &&
      other.id == id &&
      other.name == name;

    @override
    int get hashCode =>
        id.hashCode +
        (name == null ? 0 : name.hashCode);

  factory ProductVendorResponseDto.fromJson(Map<String, dynamic> json) => _$ProductVendorResponseDtoFromJson(json);

  Map<String, dynamic> toJson() => _$ProductVendorResponseDtoToJson(this);

  @override
  String toString() {
    return toJson().toString();
  }

}


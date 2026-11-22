//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:jazla_api/src/model/localized_text_response_dto.dart';
import 'package:json_annotation/json_annotation.dart';

part 'cart_vendor_response_dto.g.dart';


@JsonSerializable(
  checked: true,
  createToJson: true,
  disallowUnrecognizedKeys: false,
  explicitToJson: true,
)
class CartVendorResponseDto {
  /// Returns a new [CartVendorResponseDto] instance.
  CartVendorResponseDto({

    required  this.id,

    required  this.name,
  });

      /// The vendor (UUID).
  @JsonKey(
    
    name: r'id',
    required: true,
    includeIfNull: false,
  )


  final String id;



      /// The store’s name.
  @JsonKey(
    
    name: r'name',
    required: true,
    includeIfNull: false,
  )


  final LocalizedTextResponseDto name;





    @override
    bool operator ==(Object other) => identical(this, other) || other is CartVendorResponseDto &&
      other.id == id &&
      other.name == name;

    @override
    int get hashCode =>
        id.hashCode +
        name.hashCode;

  factory CartVendorResponseDto.fromJson(Map<String, dynamic> json) => _$CartVendorResponseDtoFromJson(json);

  Map<String, dynamic> toJson() => _$CartVendorResponseDtoToJson(this);

  @override
  String toString() {
    return toJson().toString();
  }

}


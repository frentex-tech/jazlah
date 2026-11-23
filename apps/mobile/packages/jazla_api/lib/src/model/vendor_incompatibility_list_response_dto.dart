//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:jazla_api/src/model/vendor_incompatibility_response_dto.dart';
import 'package:json_annotation/json_annotation.dart';

part 'vendor_incompatibility_list_response_dto.g.dart';


@JsonSerializable(
  checked: true,
  createToJson: true,
  disallowUnrecognizedKeys: false,
  explicitToJson: true,
)
class VendorIncompatibilityListResponseDto {
  /// Returns a new [VendorIncompatibilityListResponseDto] instance.
  VendorIncompatibilityListResponseDto({

    required  this.items,
  });

      /// Every pair whose cutting style is active, oldest rule first; empty when there is none.
  @JsonKey(
    
    name: r'items',
    required: true,
    includeIfNull: false,
  )


  final List<VendorIncompatibilityResponseDto> items;





    @override
    bool operator ==(Object other) => identical(this, other) || other is VendorIncompatibilityListResponseDto &&
      other.items == items;

    @override
    int get hashCode =>
        items.hashCode;

  factory VendorIncompatibilityListResponseDto.fromJson(Map<String, dynamic> json) => _$VendorIncompatibilityListResponseDtoFromJson(json);

  Map<String, dynamic> toJson() => _$VendorIncompatibilityListResponseDtoToJson(this);

  @override
  String toString() {
    return toJson().toString();
  }

}


//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:json_annotation/json_annotation.dart';

part 'size_availability_dto.g.dart';


@JsonSerializable(
  checked: true,
  createToJson: true,
  disallowUnrecognizedKeys: false,
  explicitToJson: true,
)
class SizeAvailabilityDto {
  /// Returns a new [SizeAvailabilityDto] instance.
  SizeAvailabilityDto({

    required  this.sizeId,

    required  this.isAvailable,
  });

      /// The id (UUID) of one of the product’s sizes (`sizes[].id` of the product); another one is VALIDATION_FAILED `isSizeOfProduct`.
  @JsonKey(
    
    name: r'sizeId',
    required: true,
    includeIfNull: false,
  )


  final String sizeId;



      /// `true`: this size can be ordered; `false`: out of stock, shown on the product page but not orderable.
  @JsonKey(
    
    name: r'isAvailable',
    required: true,
    includeIfNull: false,
  )


  final bool isAvailable;





    @override
    bool operator ==(Object other) => identical(this, other) || other is SizeAvailabilityDto &&
      other.sizeId == sizeId &&
      other.isAvailable == isAvailable;

    @override
    int get hashCode =>
        sizeId.hashCode +
        isAvailable.hashCode;

  factory SizeAvailabilityDto.fromJson(Map<String, dynamic> json) => _$SizeAvailabilityDtoFromJson(json);

  Map<String, dynamic> toJson() => _$SizeAvailabilityDtoToJson(this);

  @override
  String toString() {
    return toJson().toString();
  }

}


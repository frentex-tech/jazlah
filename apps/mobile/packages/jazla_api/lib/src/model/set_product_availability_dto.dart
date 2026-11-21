//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:json_annotation/json_annotation.dart';

part 'set_product_availability_dto.g.dart';


@JsonSerializable(
  checked: true,
  createToJson: true,
  disallowUnrecognizedKeys: false,
  explicitToJson: true,
)
class SetProductAvailabilityDto {
  /// Returns a new [SetProductAvailabilityDto] instance.
  SetProductAvailabilityDto({

    required  this.isAvailable,
  });

      /// `true`: can be ordered (shown in the public catalog when published); `false`: out of stock, hidden from the public catalog.
  @JsonKey(
    
    name: r'isAvailable',
    required: true,
    includeIfNull: false,
  )


  final bool isAvailable;





    @override
    bool operator ==(Object other) => identical(this, other) || other is SetProductAvailabilityDto &&
      other.isAvailable == isAvailable;

    @override
    int get hashCode =>
        isAvailable.hashCode;

  factory SetProductAvailabilityDto.fromJson(Map<String, dynamic> json) => _$SetProductAvailabilityDtoFromJson(json);

  Map<String, dynamic> toJson() => _$SetProductAvailabilityDtoToJson(this);

  @override
  String toString() {
    return toJson().toString();
  }

}


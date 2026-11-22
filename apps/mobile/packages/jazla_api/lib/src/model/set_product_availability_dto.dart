//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:jazla_api/src/model/size_availability_dto.dart';
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

     this.sizes,
  });

      /// `true`: can be ordered (shown in the public catalog when published); `false`: out of stock, left out of the public list, its page shown out of stock.
  @JsonKey(
    
    name: r'isAvailable',
    required: true,
    includeIfNull: false,
  )


  final bool isAvailable;



      /// Sizes to switch, each at most once (VALIDATION_FAILED `isNotRepeated` on `sizes.<i>.sizeId`); left out or empty: every size keeps its availability. A new size starts available.
  @JsonKey(
    
    name: r'sizes',
    required: false,
    includeIfNull: false,
  )


  final List<SizeAvailabilityDto>? sizes;





    @override
    bool operator ==(Object other) => identical(this, other) || other is SetProductAvailabilityDto &&
      other.isAvailable == isAvailable &&
      other.sizes == sizes;

    @override
    int get hashCode =>
        isAvailable.hashCode +
        sizes.hashCode;

  factory SetProductAvailabilityDto.fromJson(Map<String, dynamic> json) => _$SetProductAvailabilityDtoFromJson(json);

  Map<String, dynamic> toJson() => _$SetProductAvailabilityDtoToJson(this);

  @override
  String toString() {
    return toJson().toString();
  }

}


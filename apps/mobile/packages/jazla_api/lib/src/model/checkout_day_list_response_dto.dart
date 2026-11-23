//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:jazla_api/src/model/checkout_day_response_dto.dart';
import 'package:json_annotation/json_annotation.dart';

part 'checkout_day_list_response_dto.g.dart';


@JsonSerializable(
  checked: true,
  createToJson: true,
  disallowUnrecognizedKeys: false,
  explicitToJson: true,
)
class CheckoutDayListResponseDto {
  /// Returns a new [CheckoutDayListResponseDto] instance.
  CheckoutDayListResponseDto({

    required  this.items,
  });

      /// The days, today first.
  @JsonKey(
    
    name: r'items',
    required: true,
    includeIfNull: false,
  )


  final List<CheckoutDayResponseDto> items;





    @override
    bool operator ==(Object other) => identical(this, other) || other is CheckoutDayListResponseDto &&
      other.items == items;

    @override
    int get hashCode =>
        items.hashCode;

  factory CheckoutDayListResponseDto.fromJson(Map<String, dynamic> json) => _$CheckoutDayListResponseDtoFromJson(json);

  Map<String, dynamic> toJson() => _$CheckoutDayListResponseDtoToJson(this);

  @override
  String toString() {
    return toJson().toString();
  }

}


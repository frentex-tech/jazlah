//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:json_annotation/json_annotation.dart';

part 'set_product_fulfilment_dto.g.dart';


@JsonSerializable(
  checked: true,
  createToJson: true,
  disallowUnrecognizedKeys: false,
  explicitToJson: true,
)
class SetProductFulfilmentDto {
  /// Returns a new [SetProductFulfilmentDto] instance.
  SetProductFulfilmentDto({

    required  this.fulfilment,
  });

      /// How the product reaches the customer: `delivery`, `pickup` or `both`.
  @JsonKey(
    
    name: r'fulfilment',
    required: true,
    includeIfNull: false,
  unknownEnumValue: SetProductFulfilmentDtoFulfilmentEnum.unknownDefaultOpenApi,
  )


  final SetProductFulfilmentDtoFulfilmentEnum fulfilment;





    @override
    bool operator ==(Object other) => identical(this, other) || other is SetProductFulfilmentDto &&
      other.fulfilment == fulfilment;

    @override
    int get hashCode =>
        fulfilment.hashCode;

  factory SetProductFulfilmentDto.fromJson(Map<String, dynamic> json) => _$SetProductFulfilmentDtoFromJson(json);

  Map<String, dynamic> toJson() => _$SetProductFulfilmentDtoToJson(this);

  @override
  String toString() {
    return toJson().toString();
  }

}

/// How the product reaches the customer: `delivery`, `pickup` or `both`.
enum SetProductFulfilmentDtoFulfilmentEnum {
    /// How the product reaches the customer: `delivery`, `pickup` or `both`.
@JsonValue(r'delivery')
delivery(r'delivery'),
    /// How the product reaches the customer: `delivery`, `pickup` or `both`.
@JsonValue(r'pickup')
pickup(r'pickup'),
    /// How the product reaches the customer: `delivery`, `pickup` or `both`.
@JsonValue(r'both')
both(r'both'),
    /// How the product reaches the customer: `delivery`, `pickup` or `both`.
@JsonValue(r'unknown_default_open_api')
unknownDefaultOpenApi(r'unknown_default_open_api');

const SetProductFulfilmentDtoFulfilmentEnum(this.value);

final String value;

@override
String toString() => value;
}



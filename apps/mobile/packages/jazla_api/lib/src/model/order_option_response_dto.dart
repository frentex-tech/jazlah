//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:jazla_api/src/model/localized_text_response_dto.dart';
import 'package:json_annotation/json_annotation.dart';

part 'order_option_response_dto.g.dart';


@JsonSerializable(
  checked: true,
  createToJson: true,
  disallowUnrecognizedKeys: false,
  explicitToJson: true,
)
class OrderOptionResponseDto {
  /// Returns a new [OrderOptionResponseDto] instance.
  OrderOptionResponseDto({

    required  this.id,

    required  this.name,
  });

      /// The option’s id (UUID).
  @JsonKey(
    
    name: r'id',
    required: true,
    includeIfNull: false,
  )


  final String id;



      /// Its name in Arabic and English, as when ordered.
  @JsonKey(
    
    name: r'name',
    required: true,
    includeIfNull: false,
  )


  final LocalizedTextResponseDto name;





    @override
    bool operator ==(Object other) => identical(this, other) || other is OrderOptionResponseDto &&
      other.id == id &&
      other.name == name;

    @override
    int get hashCode =>
        id.hashCode +
        name.hashCode;

  factory OrderOptionResponseDto.fromJson(Map<String, dynamic> json) => _$OrderOptionResponseDtoFromJson(json);

  Map<String, dynamic> toJson() => _$OrderOptionResponseDtoToJson(this);

  @override
  String toString() {
    return toJson().toString();
  }

}


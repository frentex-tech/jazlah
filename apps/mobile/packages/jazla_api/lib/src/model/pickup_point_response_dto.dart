//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:jazla_api/src/model/geo_point_dto.dart';
import 'package:jazla_api/src/model/localized_text_response_dto.dart';
import 'package:jazla_api/src/model/time_window_dto.dart';
import 'package:json_annotation/json_annotation.dart';

part 'pickup_point_response_dto.g.dart';


@JsonSerializable(
  checked: true,
  createToJson: true,
  disallowUnrecognizedKeys: false,
  explicitToJson: true,
)
class PickupPointResponseDto {
  /// Returns a new [PickupPointResponseDto] instance.
  PickupPointResponseDto({

    required  this.name,

    required  this.address,

    required  this.location,

    required  this.phone,

    required  this.hours,
  });

      /// The store’s name.
  @JsonKey(
    
    name: r'name',
    required: true,
    includeIfNull: false,
  )


  final LocalizedTextResponseDto name;



      /// The pickup address in words; null when the store has none yet.
  @JsonKey(
    
    name: r'address',
    required: true,
    includeIfNull: true,
  )


  final LocalizedTextResponseDto? address;



      /// The pin, for directions; null when the store has none.
  @JsonKey(
    
    name: r'location',
    required: true,
    includeIfNull: true,
  )


  final GeoPointDto? location;



      /// The store’s contact number (`+9665…` or a landline); null when it has none.
  @JsonKey(
    
    name: r'phone',
    required: true,
    includeIfNull: true,
  )


  final String? phone;



      /// The store’s hours on the chosen day, Riyadh time; null before a day is chosen or when unknown.
  @JsonKey(
    
    name: r'hours',
    required: true,
    includeIfNull: true,
  )


  final TimeWindowDto? hours;





    @override
    bool operator ==(Object other) => identical(this, other) || other is PickupPointResponseDto &&
      other.name == name &&
      other.address == address &&
      other.location == location &&
      other.phone == phone &&
      other.hours == hours;

    @override
    int get hashCode =>
        name.hashCode +
        (address == null ? 0 : address.hashCode) +
        (location == null ? 0 : location.hashCode) +
        (phone == null ? 0 : phone.hashCode) +
        (hours == null ? 0 : hours.hashCode);

  factory PickupPointResponseDto.fromJson(Map<String, dynamic> json) => _$PickupPointResponseDtoFromJson(json);

  Map<String, dynamic> toJson() => _$PickupPointResponseDtoToJson(this);

  @override
  String toString() {
    return toJson().toString();
  }

}


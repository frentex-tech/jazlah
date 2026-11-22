//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:json_annotation/json_annotation.dart';

part 'closed_day_dto.g.dart';


@JsonSerializable(
  checked: true,
  createToJson: true,
  disallowUnrecognizedKeys: false,
  explicitToJson: true,
)
class ClosedDayDto {
  /// Returns a new [ClosedDayDto] instance.
  ClosedDayDto({

    required  this.date,

    required  this.scope,

    required  this.reasonAr,

    required  this.reasonEn,
  });

      /// The day, Riyadh calendar `yyyy-MM-dd`. A day added in the past is VALIDATION_FAILED `notPast`; past days already saved are kept as history.
  @JsonKey(
    
    name: r'date',
    required: true,
    includeIfNull: false,
  )


  final String date;



      /// What it closes: `both`, `delivery` or `pickup`.
  @JsonKey(
    
    name: r'scope',
    required: true,
    includeIfNull: false,
  unknownEnumValue: ClosedDayDtoScopeEnum.unknownDefaultOpenApi,
  )


  final ClosedDayDtoScopeEnum scope;



      /// Why, in Arabic, shown to the customer beside the day; 1 to 100 characters.
  @JsonKey(
    
    name: r'reasonAr',
    required: true,
    includeIfNull: false,
  )


  final String reasonAr;



      /// Why, in English; 1 to 100 characters.
  @JsonKey(
    
    name: r'reasonEn',
    required: true,
    includeIfNull: false,
  )


  final String reasonEn;





    @override
    bool operator ==(Object other) => identical(this, other) || other is ClosedDayDto &&
      other.date == date &&
      other.scope == scope &&
      other.reasonAr == reasonAr &&
      other.reasonEn == reasonEn;

    @override
    int get hashCode =>
        date.hashCode +
        scope.hashCode +
        reasonAr.hashCode +
        reasonEn.hashCode;

  factory ClosedDayDto.fromJson(Map<String, dynamic> json) => _$ClosedDayDtoFromJson(json);

  Map<String, dynamic> toJson() => _$ClosedDayDtoToJson(this);

  @override
  String toString() {
    return toJson().toString();
  }

}

/// What it closes: `both`, `delivery` or `pickup`.
enum ClosedDayDtoScopeEnum {
    /// What it closes: `both`, `delivery` or `pickup`.
@JsonValue(r'both')
both(r'both'),
    /// What it closes: `both`, `delivery` or `pickup`.
@JsonValue(r'delivery')
delivery(r'delivery'),
    /// What it closes: `both`, `delivery` or `pickup`.
@JsonValue(r'pickup')
pickup(r'pickup'),
    /// What it closes: `both`, `delivery` or `pickup`.
@JsonValue(r'unknown_default_open_api')
unknownDefaultOpenApi(r'unknown_default_open_api');

const ClosedDayDtoScopeEnum(this.value);

final String value;

@override
String toString() => value;
}



//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:jazla_api/src/model/order_status.dart';
import 'package:json_annotation/json_annotation.dart';

part 'order_history_entry_response_dto.g.dart';


@JsonSerializable(
  checked: true,
  createToJson: true,
  disallowUnrecognizedKeys: false,
  explicitToJson: true,
)
class OrderHistoryEntryResponseDto {
  /// Returns a new [OrderHistoryEntryResponseDto] instance.
  OrderHistoryEntryResponseDto({

    required  this.from,

    required  this.to,

    required  this.actorType,

    required  this.note,

    required  this.at,
  });

      /// The status before; null for the first entry (placed).
  @JsonKey(
    
    name: r'from',
    required: true,
    includeIfNull: true,
  unknownEnumValue: OrderStatus.unknownDefaultOpenApi,
  )


  final OrderStatus? from;



      /// The status after.
  @JsonKey(
    
    name: r'to',
    required: true,
    includeIfNull: false,
  unknownEnumValue: OrderStatus.unknownDefaultOpenApi,
  )


  final OrderStatus to;



      /// Who moved it.
  @JsonKey(
    
    name: r'actorType',
    required: true,
    includeIfNull: false,
  unknownEnumValue: OrderHistoryEntryResponseDtoActorTypeEnum.unknownDefaultOpenApi,
  )


  final OrderHistoryEntryResponseDtoActorTypeEnum actorType;



      /// The note given with the move (a cancellation reason, for example); null for none.
  @JsonKey(
    
    name: r'note',
    required: true,
    includeIfNull: true,
  )


  final String? note;



      /// When (UTC).
  @JsonKey(
    
    name: r'at',
    required: true,
    includeIfNull: false,
  )


  final DateTime at;





    @override
    bool operator ==(Object other) => identical(this, other) || other is OrderHistoryEntryResponseDto &&
      other.from == from &&
      other.to == to &&
      other.actorType == actorType &&
      other.note == note &&
      other.at == at;

    @override
    int get hashCode =>
        (from == null ? 0 : from.hashCode) +
        to.hashCode +
        actorType.hashCode +
        (note == null ? 0 : note.hashCode) +
        at.hashCode;

  factory OrderHistoryEntryResponseDto.fromJson(Map<String, dynamic> json) => _$OrderHistoryEntryResponseDtoFromJson(json);

  Map<String, dynamic> toJson() => _$OrderHistoryEntryResponseDtoToJson(this);

  @override
  String toString() {
    return toJson().toString();
  }

}

/// Who moved it.
enum OrderHistoryEntryResponseDtoActorTypeEnum {
    /// Who moved it.
@JsonValue(r'system')
system(r'system'),
    /// Who moved it.
@JsonValue(r'customer')
customer(r'customer'),
    /// Who moved it.
@JsonValue(r'admin')
admin(r'admin'),
    /// Who moved it.
@JsonValue(r'vendor')
vendor(r'vendor'),
    /// Who moved it.
@JsonValue(r'kitchen')
kitchen(r'kitchen'),
    /// Who moved it.
@JsonValue(r'delivery')
delivery(r'delivery'),
    /// Who moved it.
@JsonValue(r'unknown_default_open_api')
unknownDefaultOpenApi(r'unknown_default_open_api');

const OrderHistoryEntryResponseDtoActorTypeEnum(this.value);

final String value;

@override
String toString() => value;
}



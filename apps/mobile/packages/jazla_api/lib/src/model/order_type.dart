//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:json_annotation/json_annotation.dart';

/// The kind of order, from its lines; `mixed` for several kinds.
enum OrderType {
          /// The kind of order, from its lines; `mixed` for several kinds.
      @JsonValue(r'ready_meat')
      readyMeat(r'ready_meat'),
          /// The kind of order, from its lines; `mixed` for several kinds.
      @JsonValue(r'carcass')
      carcass(r'carcass'),
          /// The kind of order, from its lines; `mixed` for several kinds.
      @JsonValue(r'cooked')
      cooked(r'cooked'),
          /// The kind of order, from its lines; `mixed` for several kinds.
      @JsonValue(r'occasion')
      occasion(r'occasion'),
          /// The kind of order, from its lines; `mixed` for several kinds.
      @JsonValue(r'adha')
      adha(r'adha'),
          /// The kind of order, from its lines; `mixed` for several kinds.
      @JsonValue(r'mixed')
      mixed(r'mixed'),
          /// The kind of order, from its lines; `mixed` for several kinds.
      @JsonValue(r'unknown_default_open_api')
      unknownDefaultOpenApi(r'unknown_default_open_api');

  const OrderType(this.value);

  final String value;

  @override
  String toString() => value;
}

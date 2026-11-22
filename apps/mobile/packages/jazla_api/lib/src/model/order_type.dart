//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:json_annotation/json_annotation.dart';

/// The kinds of order it is offered for; empty: none.
enum OrderType {
          /// The kinds of order it is offered for; empty: none.
      @JsonValue(r'ready_meat')
      readyMeat(r'ready_meat'),
          /// The kinds of order it is offered for; empty: none.
      @JsonValue(r'carcass')
      carcass(r'carcass'),
          /// The kinds of order it is offered for; empty: none.
      @JsonValue(r'cooked')
      cooked(r'cooked'),
          /// The kinds of order it is offered for; empty: none.
      @JsonValue(r'occasion')
      occasion(r'occasion'),
          /// The kinds of order it is offered for; empty: none.
      @JsonValue(r'adha')
      adha(r'adha'),
          /// The kinds of order it is offered for; empty: none.
      @JsonValue(r'mixed')
      mixed(r'mixed'),
          /// The kinds of order it is offered for; empty: none.
      @JsonValue(r'unknown_default_open_api')
      unknownDefaultOpenApi(r'unknown_default_open_api');

  const OrderType(this.value);

  final String value;

  @override
  String toString() => value;
}

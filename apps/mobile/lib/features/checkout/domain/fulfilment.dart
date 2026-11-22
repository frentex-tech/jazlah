/// Checkout step 1 in the shapes of SCH-API-1 / SCH-API-2 (sprint-3.md). Dates and times are Asia/Riyadh values
/// as the server sends them (`yyyy-MM-dd`, `HH:mm`) and are never converted with the device time zone.
library;

import 'package:flutter/foundation.dart';

abstract final class FulfilmentError {
  static const notSupported = 'FULFILMENT_NOT_SUPPORTED';
  static const addressNotCovered = 'ADDRESS_NOT_COVERED';
  static const dayFull = 'DAY_FULL';
  static const orderingPaused = 'ORDERING_PAUSED';
}

/// Why a day cannot be chosen (`reason` of each day).
abstract final class DayReason {
  static const pastCutoff = 'PAST_CUTOFF';
  static const closed = 'CLOSED';
  static const full = 'FULL';
  static const outsideHorizon = 'OUTSIDE_HORIZON';
  static const vendorClosed = 'VENDOR_CLOSED';
}

/// Delivery window or pickup slot, Riyadh `HH:mm`.
@immutable
class TimeWindow {
  const TimeWindow(this.start, this.end);

  final String start;
  final String end;
}

/// One day of `GET /v1/customer/checkout/days`.
@immutable
class CheckoutDay {
  const CheckoutDay({required this.date, required this.available, required this.window, this.reason});

  /// Riyadh `yyyy-MM-dd`.
  final String date;
  final bool available;

  /// One of [DayReason] when not [available].
  final String? reason;
  final TimeWindow window;

  /// The calendar date to show, at UTC midnight so no device zone can move it to another day.
  DateTime get day => calendarDate(date);
}

/// A Riyadh `yyyy-MM-dd` as a date to show, at UTC midnight so no device zone can move it to another day.
DateTime calendarDate(String date) {
  final [y, m, d] = [for (final p in date.split('-')) int.parse(p)];
  return DateTime.utc(y, m, d);
}

/// `ops.paused` of the public client settings: when paused, checkout is blocked with the admin's message.
@immutable
class OrderingPause {
  const OrderingPause({this.isPaused = false, this.messageAr = '', this.messageEn = ''});

  final bool isPaused;
  final String messageAr;
  final String messageEn;

  String message(String language) => language == 'en' ? messageEn : messageAr;
}

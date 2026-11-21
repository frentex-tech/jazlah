import 'dart:async';

import 'package:flutter/material.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';

import 'package:jazlah/app/theme/theme.dart';
import 'package:jazlah/core/geo/geo_point.dart';

/// Moves a [MapPicker] from outside (current location, a search result).
class MapPickerController {
  void Function(GeoPoint point)? _moveTo;

  void moveTo(GeoPoint point) => _moveTo?.call(point);
}

/// A map with a fixed center pin: the user drags the map under the pin, and [onIdle] reports the
/// point under it when the map stops. Google Maps with a key ([useGoogle]); otherwise a pannable
/// mock map, so the picker keeps working without a key (the pin, the flow and the geocoding stay real).
class MapPicker extends StatefulWidget {
  const MapPicker({
    required this.initial,
    required this.onIdle,
    required this.pin,
    required this.useGoogle,
    this.onMoveStart,
    this.controller,
    super.key,
  });

  final GeoPoint initial;
  final ValueChanged<GeoPoint> onIdle;
  final VoidCallback? onMoveStart;
  final MapPickerController? controller;

  /// Drawn with its bottom (the pin's tip) on the map center.
  final Widget pin;
  final bool useGoogle;

  @override
  State<MapPicker> createState() => _MapPickerState();
}

class _MapPickerState extends State<MapPicker> {
  late GeoPoint _center = widget.initial;
  GoogleMapController? _google;

  // Mock map: degrees per logical pixel at a street-level zoom (≈2 m).
  static const _degPerPx = 0.00002;
  Offset _pan = Offset.zero;
  Timer? _idle;

  /// A move asked for before the Google map existed.
  GeoPoint? _pending;

  /// The last point reported, so the camera's first idle does not geocode the start point twice.
  GeoPoint? _reported;

  @override
  void initState() {
    super.initState();
    widget.controller?._moveTo = _moveTo;
    _reported = widget.initial;
  }

  @override
  void didUpdateWidget(MapPicker old) {
    super.didUpdateWidget(old);
    if (old.controller != widget.controller) {
      old.controller?._moveTo = null;
      widget.controller?._moveTo = _moveTo;
    }
  }

  @override
  void dispose() {
    _idle?.cancel();
    if (widget.controller?._moveTo == _moveTo) widget.controller!._moveTo = null;
    super.dispose();
  }

  void _report(GeoPoint p) {
    if (p == _reported) return;
    _reported = p;
    widget.onIdle(p);
  }

  void _moveTo(GeoPoint p) {
    if (widget.useGoogle) {
      final google = _google;
      if (google == null) {
        _pending = p;
        return;
      }
      unawaited(google.animateCamera(CameraUpdate.newLatLng(LatLng(p.latitude, p.longitude))));
    } else {
      setState(() {
        _center = p;
        _pan = Offset.zero;
      });
      _report(p);
    }
  }

  GeoPoint _mockPoint() => GeoPoint(
    _center.latitude + _pan.dy * _degPerPx, // dragging down shows what is north
    _center.longitude - _pan.dx * _degPerPx,
  );

  @override
  Widget build(BuildContext context) {
    final map = widget.useGoogle ? _googleMap() : _mockMap();
    return Stack(
      fit: StackFit.expand,
      children: [
        map,
        IgnorePointer(
          child: Center(
            child: FractionalTranslation(translation: const Offset(0, -0.5), child: widget.pin),
          ),
        ),
      ],
    );
  }

  Widget _googleMap() {
    return GoogleMap(
      initialCameraPosition: CameraPosition(target: LatLng(_center.latitude, _center.longitude), zoom: 16),
      onMapCreated: (c) {
        _google = c;
        final p = _pending;
        _pending = null;
        if (p != null) _moveTo(p);
      },
      myLocationButtonEnabled: false,
      zoomControlsEnabled: false,
      mapToolbarEnabled: false,
      compassEnabled: false,
      onCameraMoveStarted: widget.onMoveStart,
      onCameraMove: (p) => _center = GeoPoint(p.target.latitude, p.target.longitude),
      onCameraIdle: () => _report(_center),
    );
  }

  Widget _mockMap() {
    return GestureDetector(
      onPanStart: (_) => widget.onMoveStart?.call(),
      onPanUpdate: (d) => setState(() => _pan += d.delta),
      onPanEnd: (_) {
        _idle?.cancel();
        _idle = Timer(const Duration(milliseconds: 150), () => _report(_mockPoint()));
      },
      // The 1200px map image tiles; moving it by the pan is an alignment shift of 2·pan / (viewport − 1200).
      child: LayoutBuilder(
        builder: (context, c) => ClipRect(
          child: ColoredBox(
            color: JColors.sand,
            child: Image.asset(
              'assets/images/map.jpg',
              width: c.maxWidth,
              height: c.maxHeight,
              fit: BoxFit.none,
              repeat: ImageRepeat.repeat,
              alignment: Alignment(_shift(_pan.dx, c.maxWidth), _shift(_pan.dy, c.maxHeight)),
              excludeFromSemantics: true,
            ),
          ),
        ),
      ),
    );
  }

  /// Alignment offset for a pan; a viewport exactly the image size has no free room (and no NaN).
  static double _shift(double pan, double viewport) => viewport == 1200 ? 0 : 2 * pan / (viewport - 1200);
}

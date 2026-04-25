// ============================================================
// lib/features/trajet_en_cours/widgets/trajet_map_widget.dart
// Carte Leaflet via flutter_map — affiche la route + position conducteur
// Exactement comme TrajetMap.tsx côté web
// ============================================================

import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';

import '../models/trajet_en_cours_models.dart';

class TrajetMapWidget extends StatefulWidget {
  const TrajetMapWidget({
    super.key,
    required this.trip,
    this.driverPosition,
    this.height = 300,
  });

  final TrajetResponseDto trip;
  final DriverPositionDto? driverPosition;
  final double height;

  @override
  State<TrajetMapWidget> createState() => _TrajetMapWidgetState();
}

class _TrajetMapWidgetState extends State<TrajetMapWidget> {
  late final MapController _mapController;
  List<LatLng> _polylinePoints = [];
  bool _isExpanded = false;

  @override
  void initState() {
    super.initState();
    _mapController = MapController();
    _parsePolyline();
  }

  @override
  void didUpdateWidget(covariant TrajetMapWidget oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.driverPosition != widget.driverPosition && widget.driverPosition != null) {
      // Auto-pan vers la position du conducteur
      if (mounted) {
        _mapController.move(
          LatLng(widget.driverPosition!.lat, widget.driverPosition!.lng),
          _mapController.camera.zoom,
        );
      }
    }
  }

  void _parsePolyline() {
    final String? rawPolyline = widget.trip.polyline;
    if (rawPolyline == null || rawPolyline.isEmpty) {
      _polylinePoints = [
        LatLng(widget.trip.departureLat, widget.trip.departureLng),
        LatLng(widget.trip.arrivalLat, widget.trip.arrivalLng),
      ];
      return;
    }
    try {
      final dynamic decoded = jsonDecode(rawPolyline);
      if (decoded is List) {
        final List<LatLng> pts = [];
        for (final dynamic point in decoded) {
          if (point is List && point.length >= 2) {
            pts.add(LatLng(
              (point[0] as num).toDouble(),
              (point[1] as num).toDouble(),
            ));
          } else if (point is Map<String, dynamic>) {
            final double lat = (point['lat'] as num?)?.toDouble() ?? 0;
            final double lng = (point['lng'] as num?)?.toDouble() ?? 0;
            if (lat != 0 || lng != 0) pts.add(LatLng(lat, lng));
          }
        }
        if (pts.length >= 2) {
          _polylinePoints = pts;
          return;
        }
      }
    } catch (_) {}
    _polylinePoints = [
      LatLng(widget.trip.departureLat, widget.trip.departureLng),
      LatLng(widget.trip.arrivalLat, widget.trip.arrivalLng),
    ];
  }

  LatLng get _center {
    if (_polylinePoints.isEmpty) {
      return LatLng(
        (widget.trip.departureLat + widget.trip.arrivalLat) / 2,
        (widget.trip.departureLng + widget.trip.arrivalLng) / 2,
      );
    }
    double latSum = 0, lngSum = 0;
    for (final p in _polylinePoints) {
      latSum += p.latitude;
      lngSum += p.longitude;
    }
    return LatLng(latSum / _polylinePoints.length, lngSum / _polylinePoints.length);
  }

  @override
  Widget build(BuildContext context) {
    final double mapHeight = _isExpanded ? 380 : widget.height;
    return GestureDetector(
      onTap: () => setState(() => _isExpanded = !_isExpanded),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 350),
        height: mapHeight,
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: const Color(0x12000000)),
          boxShadow: const [
            BoxShadow(color: Color(0x14000000), blurRadius: 14, offset: Offset(0, 4)),
          ],
        ),
        clipBehavior: Clip.antiAlias,
        child: Stack(
          children: [
            FlutterMap(
              mapController: _mapController,
              options: MapOptions(
                initialCenter: _center,
                initialZoom: 12,
                interactionOptions: const InteractionOptions(
                  flags: InteractiveFlag.pinchZoom | InteractiveFlag.drag,
                ),
              ),
              children: [
                TileLayer(
                  urlTemplate: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
                  subdomains: const ['a', 'b', 'c'],
                  userAgentPackageName: 'com.lacite.covoiturage',
                ),
                // Polyline du trajet (partie restante — bleue)
                if (_polylinePoints.length >= 2)
                  PolylineLayer(
                    polylines: [
                      Polyline(
                        points: _polylinePoints,
                        color: const Color(0x4008316E),
                        strokeWidth: 4,
                      ),
                    ],
                  ),
                // Partie parcourue — si on a la position du conducteur
                if (_polylinePoints.length >= 2 && widget.driverPosition != null)
                  PolylineLayer(
                    polylines: [
                      Polyline(
                        points: _getCompletedPart(),
                        color: const Color(0xFF0aad6a),
                        strokeWidth: 4,
                      ),
                    ],
                  ),
                // Markers
                MarkerLayer(
                  markers: [
                    // Départ
                    Marker(
                      point: LatLng(widget.trip.departureLat, widget.trip.departureLng),
                      width: 36,
                      height: 36,
                      child: Container(
                        width: 14,
                        height: 14,
                        decoration: BoxDecoration(
                          color: const Color(0xFF08316E),
                          shape: BoxShape.circle,
                          border: Border.all(color: Colors.white, width: 2.5),
                          boxShadow: const [BoxShadow(color: Color(0x4008316E), blurRadius: 6)],
                        ),
                      ),
                    ),
                    // Arrivée
                    Marker(
                      point: LatLng(widget.trip.arrivalLat, widget.trip.arrivalLng),
                      width: 36,
                      height: 36,
                      child: const Icon(Icons.flag_rounded, color: Color(0xFFe03050), size: 28),
                    ),
                    // Position conducteur
                    if (widget.driverPosition != null)
                      Marker(
                        point: LatLng(widget.driverPosition!.lat, widget.driverPosition!.lng),
                        width: 44,
                        height: 44,
                        child: _DriverCursor(),
                      ),
                  ],
                ),
              ],
            ),
            // Overlay info — badges route
            Positioned(
              top: 10,
              left: 10,
              right: 10,
              child: _MapTopOverlay(trip: widget.trip, driverPos: widget.driverPosition),
            ),
            // Bouton expand
            Positioned(
              bottom: 10,
              right: 10,
              child: Container(
                width: 32,
                height: 32,
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.92),
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: const Color(0x12000000)),
                ),
                child: Icon(
                  _isExpanded ? Icons.fullscreen_exit : Icons.fullscreen,
                  size: 18,
                  color: const Color(0xFF08316E),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  List<LatLng> _getCompletedPart() {
    final DriverPositionDto? pos = widget.driverPosition;
    if (pos == null || _polylinePoints.isEmpty) return [];
    final LatLng driverLatLng = LatLng(pos.lat, pos.lng);

    int closestIdx = 0;
    double minDist = double.infinity;
    for (int i = 0; i < _polylinePoints.length; i++) {
      final double d = _simpleDist(_polylinePoints[i], driverLatLng);
      if (d < minDist) {
        minDist = d;
        closestIdx = i;
      }
    }
    return [..._polylinePoints.sublist(0, closestIdx + 1), driverLatLng];
  }

  double _simpleDist(LatLng a, LatLng b) {
    final double dx = (a.longitude - b.longitude) * 111000 * 0.7;
    final double dy = (a.latitude - b.latitude) * 111000;
    return dx * dx + dy * dy;
  }
}

class _DriverCursor extends StatefulWidget {
  @override
  State<_DriverCursor> createState() => _DriverCursorState();
}

class _DriverCursorState extends State<_DriverCursor> with SingleTickerProviderStateMixin {
  late AnimationController _ctrl;
  late Animation<double> _pulse;

  @override
  void initState() {
    super.initState();
    _ctrl = AnimationController(vsync: this, duration: const Duration(milliseconds: 1500))
      ..repeat(reverse: true);
    _pulse = Tween(begin: 0.6, end: 1.0).animate(_ctrl);
  }

  @override
  void dispose() {
    _ctrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _pulse,
      builder: (_, __) => Stack(
        alignment: Alignment.center,
        children: [
          Container(
            width: 36 * _pulse.value,
            height: 36 * _pulse.value,
            decoration: BoxDecoration(
              color: const Color(0x2008316E),
              shape: BoxShape.circle,
            ),
          ),
          Container(
            width: 18,
            height: 18,
            decoration: BoxDecoration(
              color: const Color(0xFF08316E),
              shape: BoxShape.circle,
              border: Border.all(color: Colors.white, width: 2),
              boxShadow: const [BoxShadow(color: Color(0x4008316E), blurRadius: 6)],
            ),
            child: const Icon(Icons.directions_car, color: Colors.white, size: 10),
          ),
        ],
      ),
    );
  }
}

class _MapTopOverlay extends StatelessWidget {
  const _MapTopOverlay({required this.trip, this.driverPos});
  final TrajetResponseDto trip;
  final DriverPositionDto? driverPos;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        // Badge départ → arrivée
        Flexible(
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.95),
              borderRadius: BorderRadius.circular(10),
              border: Border.all(color: const Color(0x12000000)),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                const _ColorDot(color: Color(0xFF08316E)),
                const SizedBox(width: 4),
                Flexible(
                  child: Text(
                    trip.displayDepartureLabel,
                    style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w700, color: Color(0xFF08316E)),
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
                const Padding(
                  padding: EdgeInsets.symmetric(horizontal: 4),
                  child: Text('→', style: TextStyle(color: Color(0xFF7a90b8), fontSize: 12)),
                ),
                Flexible(
                  child: Text(
                    trip.displayArrivalLabel,
                    style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w700, color: Color(0xFFe03050)),
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
              ],
            ),
          ),
        ),
        const SizedBox(width: 6),
        // Badge ETA / statut conducteur
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
          decoration: BoxDecoration(
            color: driverPos != null ? const Color(0xFF08316E) : const Color(0xFF7a90b8),
            borderRadius: BorderRadius.circular(10),
          ),
          child: Text(
            driverPos != null ? 'En route' : 'En attente…',
            style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w700, color: Colors.white),
          ),
        ),
      ],
    );
  }
}

class _ColorDot extends StatelessWidget {
  const _ColorDot({required this.color});
  final Color color;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 8,
      height: 8,
      margin: const EdgeInsets.only(right: 4),
      decoration: BoxDecoration(color: color, shape: BoxShape.circle),
    );
  }
}

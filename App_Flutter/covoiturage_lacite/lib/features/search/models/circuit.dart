class Circuit {
  const Circuit({
    required this.id,
    required this.label,
    required this.waypoints,
    this.tripId,
    this.departureLabel = '',
    this.arrivalLabel = '',
    this.distanceMeters = 0,
    this.durationSeconds = 0,
  });

  final String id;
  final String label;
  final List<Map<String, dynamic>> waypoints;
  final String? tripId;
  final String departureLabel;
  final String arrivalLabel;
  final double distanceMeters;
  final double durationSeconds;

  String get formattedDistance {
    if (distanceMeters <= 0) return '-';
    if (distanceMeters >= 1000) return '${(distanceMeters / 1000).toStringAsFixed(1)} km';
    return '${distanceMeters.toStringAsFixed(0)} m';
  }

  String get formattedDuration {
    if (durationSeconds <= 0) return '-';
    final int minutes = (durationSeconds / 60).round();
    if (minutes < 60) return '$minutes min';
    final int hours = minutes ~/ 60;
    final int rem = minutes % 60;
    return '${hours}h${rem.toString().padLeft(2, '0')}';
  }

  Map<String, dynamic> toJson() => <String, dynamic>{
        'id': id,
        'label': label,
        'waypoints': waypoints,
        'tripId': tripId,
        'departureLabel': departureLabel,
        'arrivalLabel': arrivalLabel,
        'distanceMeters': distanceMeters,
        'durationSeconds': durationSeconds,
      };

  /// Encode les waypoints en polyline string (simplifié, compatible serveur).
  String? _encodePolyline() {
    if (waypoints.isEmpty) return null;
    final buffer = StringBuffer();
    int prevLat = 0, prevLng = 0;
    for (final p in waypoints) {
      final lat = ((p['lat'] as double? ?? 0.0) * 1e5).round();
      final lng = ((p['lng'] as double? ?? 0.0) * 1e5).round();
      _encode(buffer, lat - prevLat);
      _encode(buffer, lng - prevLng);
      prevLat = lat;
      prevLng = lng;
    }
    return buffer.toString();
  }

  static void _encode(StringBuffer buffer, int value) {
    int v = value < 0 ? ~(value << 1) : value << 1;
    while (v >= 0x20) {
      buffer.writeCharCode((0x20 | (v & 0x1f)) + 63);
      v >>= 5;
    }
    buffer.writeCharCode(v + 63);
  }

  Map<String, dynamic> toCreateTripPrefill() => <String, dynamic>{
        'circuitId': id,
        'circuitLabel': label,
        'departureLabel': departureLabel,
        'arrivalLabel': arrivalLabel,
        'departureLat': waypoints.isNotEmpty
            ? (waypoints.first['lat'] as double? ?? 0.0)
            : 0.0,
        'departureLng': waypoints.isNotEmpty
            ? (waypoints.first['lng'] as double? ?? 0.0)
            : 0.0,
        'arrivalLat': waypoints.isNotEmpty
            ? (waypoints.last['lat'] as double? ?? 0.0)
            : 0.0,
        'arrivalLng': waypoints.isNotEmpty
            ? (waypoints.last['lng'] as double? ?? 0.0)
            : 0.0,
        'estimatedDistanceKm':
            distanceMeters > 0 ? (distanceMeters / 1000.0) : 0.0,
        'estimatedDurationMinutes':
            durationSeconds > 0 ? (durationSeconds / 60.0).round() : 0,
        'polyline': _encodePolyline(),
        if (tripId != null) 'tripId': tripId,
      };
}

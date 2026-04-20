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

  Map<String, dynamic> toCreateTripPrefill() => <String, dynamic>{
        'departureLabel': departureLabel,
        'arrivalLabel': arrivalLabel,
        'waypoints': waypoints,
        if (tripId != null) 'tripId': tripId,
      };
}

class Circuit {
  const Circuit({
    required this.id,
    required this.departureLabel,
    required this.arrivalLabel,
    required this.distanceKm,
    required this.durationMin,
    this.polyline = const <List<double>>[],
    this.pricePerSeat,
  });

  final String id;
  final String departureLabel;
  final String arrivalLabel;
  final double distanceKm;
  final int durationMin;
  final List<List<double>> polyline;
  final double? pricePerSeat;

  factory Circuit.fromJson(Map<String, dynamic> json) {
    List<List<double>> line = const <List<double>>[];
    final dynamic raw = json['polyline'] ?? json['coordinates'];
    if (raw is List) {
      line = raw.whereType<List>().map((p) {
        final List values = p;
        if (values.length < 2) return <double>[0, 0];
        return <double>[
          double.tryParse(values[0].toString()) ?? 0,
          double.tryParse(values[1].toString()) ?? 0,
        ];
      }).toList();
    }
    return Circuit(
      id: json['id']?.toString() ?? '',
      departureLabel: json['departureLabel']?.toString() ?? json['from']?.toString() ?? '',
      arrivalLabel: json['arrivalLabel']?.toString() ?? json['to']?.toString() ?? '',
      distanceKm: double.tryParse((json['distanceKm'] ?? json['distance'] ?? 0).toString()) ?? 0,
      durationMin: int.tryParse((json['durationMin'] ?? json['duration'] ?? 0).toString()) ?? 0,
      polyline: line,
      pricePerSeat: double.tryParse((json['pricePerSeat'] ?? json['price'] ?? '').toString()),
    );
  }

  Map<String, dynamic> toCreateTripPrefill() {
    return <String, dynamic>{
      'departureLabel': departureLabel,
      'arrivalLabel': arrivalLabel,
      'pricePerSeat': pricePerSeat,
      'selectedCircuitId': id,
      'polyline': polyline,
    };
  }
}

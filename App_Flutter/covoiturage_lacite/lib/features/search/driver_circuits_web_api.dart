import 'dart:convert';

import 'package:http/http.dart' as http;

import 'models/circuit.dart';

/// Appelle l'API circuits du site web et convertit la reponse en `List<Circuit>`.
Future<List<Circuit>> fetchDriverCircuitsFromWeb({
  required double depLng,
  required double depLat,
  required double arrLng,
  required double arrLat,
  String depLabel = 'Depart',
  String arrLabel = 'Arrivee',
}) async {
  final Uri url = Uri.parse(
    'http://192.168.2.16:3000/api/circuits'
    '?dep=$depLng,$depLat'
    '&arr=$arrLng,$arrLat'
    '&depLabel=${Uri.encodeComponent(depLabel)}'
    '&arrLabel=${Uri.encodeComponent(arrLabel)}',
  );

  try {
    final http.Response response =
        await http.get(url).timeout(const Duration(seconds: 8));

    if (response.statusCode == 200) {
      final dynamic data = jsonDecode(response.body);

      if (data is List) {
        final List<Circuit> parsed = data
            .whereType<Map<String, dynamic>>()
            .map<Circuit>(
              (Map<String, dynamic> e) => circuitFromWebApi(
                e,
                depLat: depLat,
                depLng: depLng,
                arrLat: arrLat,
                arrLng: arrLng,
              ),
            )
            .toList();
        if (parsed.isNotEmpty) return parsed;
      }

      if (data is Map && data['circuits'] is List) {
        final List<Circuit> parsed = (data['circuits'] as List)
            .whereType<Map<String, dynamic>>()
            .map<Circuit>(
              (Map<String, dynamic> e) => circuitFromWebApi(
                e,
                depLat: depLat,
                depLng: depLng,
                arrLat: arrLat,
                arrLng: arrLng,
              ),
            )
            .toList();
        if (parsed.isNotEmpty) return parsed;
      }

      throw Exception('Format de reponse inattendu');
    }

    throw Exception('Erreur lors de la recuperation des circuits');
  } catch (_) {
    return _fixtureCircuits(
      depLat: depLat,
      depLng: depLng,
      arrLat: arrLat,
      arrLng: arrLng,
      depLabel: depLabel,
      arrLabel: arrLabel,
    );
  }
}

/// Convertit un circuit JSON du web en Circuit Flutter.
Circuit circuitFromWebApi(
  Map<String, dynamic> json, {
  required double depLat,
  required double depLng,
  required double arrLat,
  required double arrLng,
}) {
  final List<Map<String, dynamic>> waypoints = _extractWaypoints(
    json,
    depLat: depLat,
    depLng: depLng,
    arrLat: arrLat,
    arrLng: arrLng,
  );

  final String departureLabel =
      json['departureLabel']?.toString() ?? json['depLabel']?.toString() ?? '';
  final String arrivalLabel =
      json['arrivalLabel']?.toString() ?? json['arrLabel']?.toString() ?? '';

  return Circuit(
    id: json['id']?.toString() ?? json['routeIndex']?.toString() ?? '',
    label: json['label']?.toString() ??
        json['summary']?.toString() ??
        'Circuit ${json['routeIndex'] ?? ''}'.trim(),
    waypoints: waypoints.isNotEmpty
        ? waypoints
        : <Map<String, dynamic>>[
            <String, dynamic>{'lat': depLat, 'lng': depLng},
            <String, dynamic>{'lat': arrLat, 'lng': arrLng},
          ],
    tripId: json['tripId']?.toString(),
    departureLabel: departureLabel,
    arrivalLabel: arrivalLabel,
    distanceMeters: _toDouble(json['distanceMeters'] ?? json['distance']),
    durationSeconds: _toDouble(json['durationSeconds'] ?? json['duration']),
  );
}

List<Map<String, dynamic>> _extractWaypoints(
  Map<String, dynamic> row, {
  required double depLat,
  required double depLng,
  required double arrLat,
  required double arrLng,
}) {
  final dynamic fromPrimary =
      row['polyline'] ?? row['waypoints'] ?? row['latLngs'] ?? row['points'];
  final dynamic geometry = row['geometry'];
  final dynamic fromGeometry =
      geometry is Map<String, dynamic> ? geometry['coordinates'] : null;
  final dynamic source =
      fromPrimary ?? fromGeometry ?? row['coordinates'] ?? const <dynamic>[];

  if (source is! List) return const <Map<String, dynamic>>[];

  return source
      .map<Map<String, dynamic>>(
        (dynamic p) => _normalizeWaypoint(
          p,
          depLat: depLat,
          depLng: depLng,
          arrLat: arrLat,
          arrLng: arrLng,
        ),
      )
      .where((Map<String, dynamic> point) =>
          (point['lat'] as double) != 0 || (point['lng'] as double) != 0)
      .toList();
}

Map<String, dynamic> _normalizeWaypoint(
  dynamic point, {
  required double depLat,
  required double depLng,
  required double arrLat,
  required double arrLng,
}) {
  if (point is List && point.length >= 2) {
    final double first = _toDouble(point[0]);
    final double second = _toDouble(point[1]);

    return _bestOrientation(
      first: first,
      second: second,
      depLat: depLat,
      depLng: depLng,
      arrLat: arrLat,
      arrLng: arrLng,
    );
  }

  if (point is Map<String, dynamic>) {
    final double lat = _toDouble(
      point['lat'] ?? point['latitude'] ?? point['y'],
    );
    final double lng = _toDouble(
      point['lng'] ?? point['lon'] ?? point['longitude'] ?? point['x'],
    );

    if (lat != 0 || lng != 0) {
      return <String, dynamic>{'lat': lat, 'lng': lng};
    }

    final dynamic coords = point['coordinates'];
    if (coords is List && coords.length >= 2) {
      return _normalizeWaypoint(
        coords,
        depLat: depLat,
        depLng: depLng,
        arrLat: arrLat,
        arrLng: arrLng,
      );
    }
  }

  return const <String, dynamic>{'lat': 0.0, 'lng': 0.0};
}

Map<String, dynamic> _bestOrientation({
  required double first,
  required double second,
  required double depLat,
  required double depLng,
  required double arrLat,
  required double arrLng,
}) {
  final bool firstAsLatValid = first.abs() <= 90 && second.abs() <= 180;
  final bool firstAsLngValid = first.abs() <= 180 && second.abs() <= 90;

  if (firstAsLatValid && !firstAsLngValid) {
    return <String, dynamic>{'lat': first, 'lng': second};
  }
  if (!firstAsLatValid && firstAsLngValid) {
    return <String, dynamic>{'lat': second, 'lng': first};
  }
  if (!firstAsLatValid && !firstAsLngValid) {
    return const <String, dynamic>{'lat': 0.0, 'lng': 0.0};
  }

  final double scoreLatLng = _distanceScore(
    lat: first,
    lng: second,
    depLat: depLat,
    depLng: depLng,
    arrLat: arrLat,
    arrLng: arrLng,
  );
  final double scoreLngLat = _distanceScore(
    lat: second,
    lng: first,
    depLat: depLat,
    depLng: depLng,
    arrLat: arrLat,
    arrLng: arrLng,
  );

  if (scoreLatLng <= scoreLngLat) {
    return <String, dynamic>{'lat': first, 'lng': second};
  }
  return <String, dynamic>{'lat': second, 'lng': first};
}

double _distanceScore({
  required double lat,
  required double lng,
  required double depLat,
  required double depLng,
  required double arrLat,
  required double arrLng,
}) {
  final double dep = (lat - depLat).abs() + (lng - depLng).abs();
  final double arr = (lat - arrLat).abs() + (lng - arrLng).abs();
  return dep < arr ? dep : arr;
}

List<Circuit> _fixtureCircuits({
  required double depLat,
  required double depLng,
  required double arrLat,
  required double arrLng,
  required String depLabel,
  required String arrLabel,
}) {
  final double midLat = (depLat + arrLat) / 2;
  final double midLng = (depLng + arrLng) / 2;

  final List<Map<String, dynamic>> base = <Map<String, dynamic>>[
    <String, dynamic>{'lat': depLat, 'lng': depLng},
    <String, dynamic>{'lat': midLat, 'lng': midLng},
    <String, dynamic>{'lat': arrLat, 'lng': arrLng},
  ];
  final List<Map<String, dynamic>> north = <Map<String, dynamic>>[
    <String, dynamic>{'lat': depLat, 'lng': depLng},
    <String, dynamic>{'lat': midLat + 0.012, 'lng': midLng - 0.006},
    <String, dynamic>{'lat': arrLat, 'lng': arrLng},
  ];
  final List<Map<String, dynamic>> south = <Map<String, dynamic>>[
    <String, dynamic>{'lat': depLat, 'lng': depLng},
    <String, dynamic>{'lat': midLat - 0.010, 'lng': midLng + 0.008},
    <String, dynamic>{'lat': arrLat, 'lng': arrLng},
  ];

  return <Circuit>[
    Circuit(
      id: 'fixture_circuit_1',
      label: 'Circuit principal',
      waypoints: base,
      departureLabel: depLabel,
      arrivalLabel: arrLabel,
      distanceMeters: 12800,
      durationSeconds: 1380,
    ),
    Circuit(
      id: 'fixture_circuit_2',
      label: 'Alternative nord',
      waypoints: north,
      departureLabel: depLabel,
      arrivalLabel: arrLabel,
      distanceMeters: 14200,
      durationSeconds: 1600,
    ),
    Circuit(
      id: 'fixture_circuit_3',
      label: 'Alternative sud',
      waypoints: south,
      departureLabel: depLabel,
      arrivalLabel: arrLabel,
      distanceMeters: 13600,
      durationSeconds: 1510,
    ),
  ];
}

double _toDouble(dynamic value) {
  if (value is num) return value.toDouble();
  return double.tryParse(value?.toString() ?? '') ?? 0;
}

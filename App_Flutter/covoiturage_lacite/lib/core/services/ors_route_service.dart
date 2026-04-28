import 'package:dio/dio.dart';

class OrsPlaceSuggestion {
  const OrsPlaceSuggestion({
    required this.label,
    required this.lat,
    required this.lng,
  });

  final String label;
  final double lat;
  final double lng;

  Map<String, dynamic> toJson() => <String, dynamic>{
        'label': label,
        'lat': lat,
        'lng': lng,
      };
}

class OrsRouteService {
  OrsRouteService._();

  static final OrsRouteService instance = OrsRouteService._();

  static const String _orsKey = String.fromEnvironment(
    'OPEN_ROUTES_SERVICE_KEY',
    defaultValue: '',
  );
  static const String _orsBase = String.fromEnvironment(
    'OPEN_ROUTES_SERVICE_URL',
    defaultValue: 'https://api.openrouteservice.org/v2/directions/driving-car',
  );
  static const String _orsGeocode = String.fromEnvironment(
    'OPEN_ROUTES_SERVICE_GEOCODE_URL',
    defaultValue: 'https://api.openrouteservice.org/geocode/search',
  );
  static const String _webPublicBaseUrl = String.fromEnvironment(
    'WEB_PUBLIC_URL',
    defaultValue: 'https://covoiturage-la-cite.vercel.app',
  );

  final Dio _dio = Dio(
    BaseOptions(
      connectTimeout: const Duration(seconds: 8),
      receiveTimeout: const Duration(seconds: 12),
      sendTimeout: const Duration(seconds: 8),
    ),
  );

  Future<List<OrsPlaceSuggestion>> suggestPlaces(
    String query, {
    int limit = 5,
  }) async {
    final String text = query.trim();
    if (text.length < 3) return const <OrsPlaceSuggestion>[];

    final List<OrsPlaceSuggestion> publicWeb =
        await _suggestWithPublicWeb(text, limit: limit);
    if (publicWeb.isNotEmpty) return publicWeb;

    final List<OrsPlaceSuggestion> ors =
        await _suggestWithOrs(text, limit: limit);
    if (ors.isNotEmpty) return ors;

    return _suggestWithNominatim(text, limit: limit);
  }

  Future<OrsPlaceSuggestion?> geocodeFirst(String label) async {
    final List<OrsPlaceSuggestion> items = await suggestPlaces(label, limit: 1);
    if (items.isEmpty) return null;
    return items.first;
  }

  Future<List<Map<String, dynamic>>> routeBetweenLabels({
    required String fromText,
    required String toText,
  }) async {
    final OrsPlaceSuggestion? from = await geocodeFirst(fromText);
    final OrsPlaceSuggestion? to = await geocodeFirst(toText);
    if (from == null || to == null) return <Map<String, dynamic>>[];

    return routeBetweenCoords(
      fromLat: from.lat,
      fromLng: from.lng,
      toLat: to.lat,
      toLng: to.lng,
    );
  }

  Future<List<Map<String, dynamic>>> routeBetweenCoords({
    required double fromLat,
    required double fromLng,
    required double toLat,
    required double toLng,
  }) async {
    if (fromLat == 0 || fromLng == 0 || toLat == 0 || toLng == 0) {
      return <Map<String, dynamic>>[];
    }

    final List<Map<String, dynamic>> ors = await _routeWithOrs(
      fromLat: fromLat,
      fromLng: fromLng,
      toLat: toLat,
      toLng: toLng,
    );
    if (ors.isNotEmpty) return ors;

    return _routeWithOsrm(
      fromLat: fromLat,
      fromLng: fromLng,
      toLat: toLat,
      toLng: toLng,
    );
  }

  Future<List<OrsPlaceSuggestion>> _suggestWithOrs(
    String text, {
    required int limit,
  }) async {
    if (_orsKey.isEmpty) return const <OrsPlaceSuggestion>[];

    try {
      final Response<dynamic> response = await _dio.get<dynamic>(
        _orsGeocode,
        queryParameters: <String, dynamic>{
          'api_key': _orsKey,
          'text': text,
          'size': limit.clamp(1, 10),
        },
      );

      final dynamic features =
          (response.data as Map<String, dynamic>?)?['features'];
      if (features is! List) return const <OrsPlaceSuggestion>[];

      return features
          .whereType<Map<String, dynamic>>()
          .map<OrsPlaceSuggestion?>((Map<String, dynamic> feature) {
            final dynamic geometry = feature['geometry'];
            final dynamic coords = geometry is Map<String, dynamic>
                ? geometry['coordinates']
                : null;
            if (coords is! List || coords.length < 2) return null;

            final double lng = (coords[0] as num?)?.toDouble() ?? 0;
            final double lat = (coords[1] as num?)?.toDouble() ?? 0;
            if (lat == 0 && lng == 0) return null;

            final dynamic properties = feature['properties'];
            final String label = properties is Map<String, dynamic>
                ? (properties['label']?.toString() ?? text)
                : text;

            return OrsPlaceSuggestion(label: label, lat: lat, lng: lng);
          })
          .whereType<OrsPlaceSuggestion>()
          .toList();
    } catch (_) {
      return const <OrsPlaceSuggestion>[];
    }
  }

  Future<List<OrsPlaceSuggestion>> _suggestWithPublicWeb(
    String text, {
    required int limit,
  }) async {
    try {
      final Uri base = Uri.parse(_webPublicBaseUrl);
      final Uri url = base.replace(
        path: '/api/locations/suggestions',
        queryParameters: <String, String>{
          'q': text,
          'limit': '${limit.clamp(1, 10)}',
        },
      );
      final Response<dynamic> response = await _dio.getUri<dynamic>(url);
      return _extractSuggestions(response.data);
    } catch (_) {
      return const <OrsPlaceSuggestion>[];
    }
  }

  List<OrsPlaceSuggestion> _extractSuggestions(dynamic payload) {
    final dynamic rows = (payload is Map<String, dynamic>)
        ? (payload['suggestions'] ?? payload['data'] ?? payload['items'])
        : payload;
    if (rows is! List) return const <OrsPlaceSuggestion>[];

    return rows
        .whereType<Map<String, dynamic>>()
        .map<OrsPlaceSuggestion?>((Map<String, dynamic> row) {
          final String label = row['label']?.toString().trim() ??
              row['name']?.toString().trim() ??
              row['display_name']?.toString().trim() ??
              '';
          if (label.isEmpty) return null;

          double? lat = _toNullableDouble(row['lat'] ?? row['latitude']);
          double? lng =
              _toNullableDouble(row['lng'] ?? row['lon'] ?? row['longitude']);

          final dynamic coords = row['coordinates'] ?? row['coordonnees'];
          if ((lat == null || lng == null) &&
              coords is List &&
              coords.length >= 2) {
            final double? first = _toNullableDouble(coords[0]);
            final double? second = _toNullableDouble(coords[1]);
            if (first != null && second != null) {
              if (first.abs() <= 180 && second.abs() <= 90) {
                lng = first;
                lat = second;
              } else if (first.abs() <= 90 && second.abs() <= 180) {
                lat = first;
                lng = second;
              }
            }
          }

          if (lat == null || lng == null) return null;
          if (lat == 0 && lng == 0) return null;
          return OrsPlaceSuggestion(label: label, lat: lat, lng: lng);
        })
        .whereType<OrsPlaceSuggestion>()
        .toList();
  }

  double? _toNullableDouble(dynamic value) {
    if (value is num) return value.toDouble();
    return double.tryParse(value?.toString() ?? '');
  }

  Future<List<OrsPlaceSuggestion>> _suggestWithNominatim(
    String text, {
    required int limit,
  }) async {
    try {
      final Response<dynamic> response = await _dio.get<dynamic>(
        'https://nominatim.openstreetmap.org/search',
        queryParameters: <String, dynamic>{
          'q': text,
          'format': 'jsonv2',
          'limit': limit.clamp(1, 10),
          'addressdetails': 1,
        },
        options: Options(
          headers: <String, dynamic>{
            'User-Agent': 'CovoiturageLaCiteMobile/1.0',
          },
        ),
      );

      final dynamic rows = response.data;
      if (rows is! List) return const <OrsPlaceSuggestion>[];

      return rows
          .whereType<Map<String, dynamic>>()
          .map<OrsPlaceSuggestion?>((Map<String, dynamic> row) {
            final double lat =
                double.tryParse(row['lat']?.toString() ?? '') ?? 0;
            final double lng =
                double.tryParse(row['lon']?.toString() ?? '') ?? 0;
            if (lat == 0 && lng == 0) return null;

            final String label = row['display_name']?.toString().trim() ?? text;
            return OrsPlaceSuggestion(label: label, lat: lat, lng: lng);
          })
          .whereType<OrsPlaceSuggestion>()
          .toList();
    } catch (_) {
      return const <OrsPlaceSuggestion>[];
    }
  }

  Future<List<Map<String, dynamic>>> _routeWithOrs({
    required double fromLat,
    required double fromLng,
    required double toLat,
    required double toLng,
  }) async {
    if (_orsKey.isEmpty) return <Map<String, dynamic>>[];

    try {
      final Response<dynamic> routeResponse = await _dio.post<dynamic>(
        '$_orsBase/geojson',
        data: <String, dynamic>{
          'coordinates': <List<double>>[
            <double>[fromLng, fromLat],
            <double>[toLng, toLat],
          ],
        },
        options: Options(
          headers: <String, dynamic>{
            'Authorization': _orsKey,
            'Content-Type': 'application/json',
            'Accept': 'application/geo+json',
          },
        ),
      );

      final dynamic features =
          (routeResponse.data as Map<String, dynamic>?)?['features'];
      if (features is! List || features.isEmpty) {
        return <Map<String, dynamic>>[];
      }
      final dynamic coordinates = (features.first
          as Map<String, dynamic>?)?['geometry']?['coordinates'];
      if (coordinates is! List) {
        return <Map<String, dynamic>>[];
      }

      return coordinates
          .whereType<List<dynamic>>()
          .where((List<dynamic> row) => row.length >= 2)
          .map((List<dynamic> row) => <String, dynamic>{
                'lat': (row[1] as num?)?.toDouble() ?? 0,
                'lng': (row[0] as num?)?.toDouble() ?? 0,
              })
          .where((Map<String, dynamic> p) =>
              (p['lat'] as double) != 0 || (p['lng'] as double) != 0)
          .toList();
    } catch (_) {
      return <Map<String, dynamic>>[];
    }
  }

  Future<List<Map<String, dynamic>>> _routeWithOsrm({
    required double fromLat,
    required double fromLng,
    required double toLat,
    required double toLng,
  }) async {
    try {
      final Response<dynamic> routeResponse = await _dio.get<dynamic>(
        'https://router.project-osrm.org/route/v1/driving/$fromLng,$fromLat;$toLng,$toLat',
        queryParameters: <String, dynamic>{
          'overview': 'full',
          'geometries': 'geojson',
        },
      );

      final dynamic routes =
          (routeResponse.data as Map<String, dynamic>?)?['routes'];
      if (routes is! List || routes.isEmpty) return <Map<String, dynamic>>[];

      final dynamic coordinates =
          (routes.first as Map<String, dynamic>?)?['geometry']?['coordinates'];
      if (coordinates is! List) return <Map<String, dynamic>>[];

      return coordinates
          .whereType<List<dynamic>>()
          .where((List<dynamic> row) => row.length >= 2)
          .map((List<dynamic> row) => <String, dynamic>{
                'lat': (row[1] as num?)?.toDouble() ?? 0,
                'lng': (row[0] as num?)?.toDouble() ?? 0,
              })
          .where((Map<String, dynamic> p) =>
              (p['lat'] as double) != 0 || (p['lng'] as double) != 0)
          .toList();
    } catch (_) {
      return <Map<String, dynamic>>[];
    }
  }
}

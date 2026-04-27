// ============================================================
// lib/features/trip/trip_view_converter.dart
// ViewConverter centralisé — feature trip
// Transforme les payloads bruts API → types vues Trip/Reservation
// ============================================================

import '../../core/models/trip.dart';
import '../../core/utils/parsing.dart' as parsing;

/// Résultat d'une suggestion de lieu (départ/arrivée)
class PlaceSuggestion {
  final String label;
  final double lat;
  final double lng;

  const PlaceSuggestion({
    required this.label,
    required this.lat,
    required this.lng,
  });
}

abstract final class TripViewConverter {
  // ─── Extraction liste de trajets ──────────────────────────
  static List<Trip> toTripList(dynamic payload) {
    return parsing
        .extractList(payload)
        .whereType<Map<String, dynamic>>()
        .map(_safeFromJson)
        .whereType<Trip>()
        .toList();
  }

  // ─── Extraction trajet unique ─────────────────────────────
  static Trip? toTrip(dynamic payload) {
    final map = parsing.extractMap(payload);
    if (map == null || map.isEmpty) return null;
    return _safeFromJson(map);
  }

  static Trip? _safeFromJson(Map<String, dynamic> json) {
    try {
      return Trip.fromJson(json);
    } catch (_) {
      return null;
    }
  }

  // ─── Extraction coordonnées depuis payload trajet ─────────
  static double? extractLat(Map<String, dynamic>? raw) {
    if (raw == null) return null;
    final v = raw['departureLat'] ?? raw['lat'] ?? raw['latitude'];
    return _toNullableDouble(v);
  }

  static double? extractLng(Map<String, dynamic>? raw) {
    if (raw == null) return null;
    final v = raw['departureLng'] ?? raw['lng'] ?? raw['longitude'];
    return _toNullableDouble(v);
  }

  static double? extractArrivalLat(Map<String, dynamic>? raw) {
    if (raw == null) return null;
    final v = raw['arrivalLat'] ?? raw['arrivalLatitude'];
    return _toNullableDouble(v);
  }

  static double? extractArrivalLng(Map<String, dynamic>? raw) {
    if (raw == null) return null;
    final v = raw['arrivalLng'] ?? raw['arrivalLongitude'];
    return _toNullableDouble(v);
  }

  // ─── Extraction polyline ──────────────────────────────────
  static List<Map<String, double>> extractPolylinePoints(
      Map<String, dynamic>? raw) {
    if (raw == null) return [];
    final source = raw['polyline'] ??
        raw['routePolyline'] ??
        raw['waypoints'] ??
        raw['coordinates'];
    if (source is! List) return [];
    return source
        .map<Map<String, double>?>((dynamic row) {
          if (row is List && row.length >= 2) {
            final lat = _toNullableDouble(row[0]);
            final lng = _toNullableDouble(row[1]);
            if (lat == null || lng == null) return null;
            return {'lat': lat, 'lng': lng};
          }
          if (row is Map) {
            final lat = _toNullableDouble(row['lat'] ?? row['latitude']);
            final lng =
                _toNullableDouble(row['lng'] ?? row['lon'] ?? row['longitude']);
            if (lat == null || lng == null) return null;
            return {'lat': lat, 'lng': lng};
          }
          return null;
        })
        .whereType<Map<String, double>>()
        .toList();
  }

  // ─── Construction du body POST /api/trips ────────────────
  /// Construit le body complet conforme à CreateTrajetDto.
  /// Tous les champs obligatoires sont inclus.
  static Map<String, dynamic> buildCreateTripBody({
    required String departureLabel,
    required String departureAddress,
    required double departureLat,
    required double departureLng,
    required String arrivalLabel,
    required String arrivalAddress,
    required double arrivalLat,
    required double arrivalLng,
    required DateTime departureDt,
    required String vehicleId,
    required int maxPassengers,
    required double pricePerPassenger,
    required String paymentMethod, // 'cash' | 'interac'
    required String tripType, // 'unique' | 'recurrent'
    required bool baggageAllowed,
    required bool petsAllowed,
    required bool smokingAllowed,
    required bool musicAllowed,
    bool flexibleItinerary = false,
    String? driverNote,
    int estimatedDurationMinutes = 0,
    double estimatedDistanceKm = 0,
    String? polyline,
    List<int>? recurrenceDays,
    String? recurrenceEndDate, // 'YYYY-MM-DD'
    bool publish = true,
  }) {
    final String pad2 = '';

    String p(int v) => v < 10 ? '0$v' : '$v';

    final String dateOnly =
        '${departureDt.year}-${p(departureDt.month)}-${p(departureDt.day)}';
    final String timeOnly =
        '${p(departureDt.hour)}:${p(departureDt.minute)}:00';

    final body = <String, dynamic>{
      // Véhicule
      'vehicleId': vehicleId,

      // Départ
      'departureLabel': departureLabel,
      'departureAddress':
          departureAddress.isEmpty ? departureLabel : departureAddress,
      'departureLat': departureLat,
      'departureLng': departureLng,

      // Arrivée
      'arrivalLabel': arrivalLabel,
      'arrivalAddress': arrivalAddress.isEmpty ? arrivalLabel : arrivalAddress,
      'arrivalLat': arrivalLat,
      'arrivalLng': arrivalLng,

      // Horaire (format DateOnly + TimeOnly séparés — requis par CreateTrajetDto)
      'departureDate': dateOnly,
      'departureTime': timeOnly,

      // Capacité / prix
      'maxPassengers': maxPassengers,
      'pricePerPassenger': pricePerPassenger,
      'paymentMethod': paymentMethod,

      // Type
      'tripType': tripType,

      // Données géo ORS (0 si non calculées)
      'estimatedDurationMinutes': estimatedDurationMinutes,
      'estimatedDistanceKm': estimatedDistanceKm,
      if (polyline != null) 'polyline': polyline,

      // Préférences
      'baggageAllowed': baggageAllowed,
      'petsAllowed': petsAllowed,
      'smokingAllowed': smokingAllowed,
      'musicAllowed': musicAllowed,
      'conversationLevel': 'moderate',
      if (driverNote != null && driverNote.isNotEmpty) 'driverNote': driverNote,

      // Statut
      // Le serveur interprète status='draft' vs publish flag
      // On utilise le champ status comme indiqué dans CreateTrajetDto
    };

    if (tripType == 'recurrent') {
      if (recurrenceDays != null && recurrenceDays.isNotEmpty) {
        body['recurrenceDays'] = recurrenceDays;
      }
      if (recurrenceEndDate != null) {
        body['recurrenceEndDate'] = recurrenceEndDate;
      }
    }

    return body;
  }

  // ─── Conversion statut string → PTReservationStatus ──────
  static String normalizeStatus(String? raw) {
    if (raw == null) return 'pending';
    switch (raw.toLowerCase().replaceAll('-', '_')) {
      case 'confirmed':
      case 'confirme':
        return 'confirmed';
      case 'cancelled':
      case 'annule':
      case 'cancelled_by_passenger':
      case 'cancelled_by_driver':
        return 'cancelled';
      case 'refused':
      case 'rejected':
      case 'refuse':
        return 'refused';
      case 'in_progress':
      case 'inprogress':
        return 'in_progress';
      case 'completed':
      case 'termine':
        return 'completed';
      case 'no_show':
        return 'no_show';
      case 'imminent':
        return 'imminent';
      default:
        return 'pending';
    }
  }

  // ─── Helpers ─────────────────────────────────────────────
  static double? _toNullableDouble(dynamic v) {
    if (v is num) return v.toDouble();
    return double.tryParse(v?.toString() ?? '');
  }
}
